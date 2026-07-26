import { Injectable, Logger, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { DouyinVideoInfo } from '../types';

/**
 * 抖音解析服务
 *
 * 解析流程:
 * 1. 从分享文本中提取 URL(短链)
 * 2. 请求短链拿到 302 重定向地址,提取 video_id
 * 3. 调用抖音官方分享页 API 拿到视频元数据
 * 4. 提取无水印播放地址
 *
 * 注意:抖音会持续变更接口,这里采用稳健的回退策略,失败时给出明确错误。
 */
@Injectable()
export class DouyinService {
  private readonly logger = new Logger(DouyinService.name);
  private readonly UA =
    'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1';

  constructor(private readonly http: HttpService) {}

  async parse(shareText: string): Promise<DouyinVideoInfo> {
    const url = this.extractUrl(shareText);
    if (!url) {
      throw new BadRequestException('未在文本中检测到抖音链接');
    }
    this.logger.log(`开始解析: ${url}`);

    try {
      const videoId = await this.resolveVideoId(url);
      this.logger.log(`解析到 videoId: ${videoId}`);
      const meta = await this.fetchVideoMeta(videoId);
      return this.normalize(meta);
    } catch (e: any) {
      this.logger.error(`解析失败: ${e?.message}`, e?.stack);
      if (e instanceof BadRequestException) throw e;
      throw new InternalServerErrorException(e?.message || '解析过程出错');
    }
  }

  /** 从分享文本中提取 URL */
  private extractUrl(text: string): string | null {
    if (!text) return null;
    const m = text.match(/https?:\/\/[^\s,，。]+/);
    return m ? m[0] : null;
  }

  /** 通过短链 302 跳转拿到 video_id */
  private async resolveVideoId(shortUrl: string): Promise<string> {
    // v.douyin.com 短链会 302 跳到 https://www.iesdouyin.com/share/video/{id}/
    const resp = await firstValueFrom(
      this.http.get(shortUrl, {
        maxRedirects: 0,
        validateStatus: (s) => s >= 200 && s < 400,
        headers: { 'User-Agent': this.UA },
      }),
    );
    const location: string | undefined =
      (resp.headers as any)?.location || (resp.headers as any)?.Location;
    if (!location) {
      // 部分场景直接返回 200,URL 已包含 id
      const m = (resp.request?.res?.responseUrl || shortUrl).match(/\/video\/(\d+)/);
      if (m) return m[1];
      throw new BadRequestException('无法从链接解析出 video_id');
    }
    const m = location.match(/\/video\/(\d+)/);
    if (!m) throw new BadRequestException('链接重定向地址中未找到 video_id');
    return m[1];
  }

  /** 拉取视频元数据(抖音分享页接口) */
  private async fetchVideoMeta(videoId: string): Promise<any> {
    const apiUrl = `https://www.iesdouyin.com/share/video/${videoId}`;
    const resp = await firstValueFrom(
      this.http.get(apiUrl, {
        headers: {
          'User-Agent': this.UA,
          Referer: 'https://www.iesdouyin.com/',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        responseType: 'text',
        maxRedirects: 5,
      }),
    );
    const html: string = typeof resp.data === 'string' ? resp.data : String(resp.data ?? '');
    const data = this.extractRenderData(html);
    if (!data) {
      throw new InternalServerErrorException('抖音页面未返回有效数据,接口可能已变更');
    }
    return data;
  }

  /** 从 HTML 中提取 _ROUTER_DATA / renderData */
  private extractRenderData(html: string): any {
    // 模式 1: window._ROUTER_DATA = {...}
    const m1 = html.match(/window\._ROUTER_DATA\s*=\s*(\{[\s\S]*?\});?\s*<\/script>/);
    if (m1) {
      try {
        return JSON.parse(m1[1]);
      } catch {
        /* continue */
      }
    }
    // 模式 2: <script id="RENDER_DATA">...
    const m2 = html.match(/id="RENDER_DATA"[^>]*>([\s\S]*?)<\/script>/);
    if (m2) {
      try {
        const decoded = decodeURIComponent(m2[1]);
        return JSON.parse(decoded);
      } catch {
        /* continue */
      }
    }
    return null;
  }

  /** 从原始元数据中规范化出 DouyinVideoInfo */
  private normalize(raw: any): DouyinVideoInfo {
    // 数据结构在 shareVideo 下,优先取 videoInfoRes.video_data
    const videoInfo = this.deepFind(raw, (v) => v && v.video && v.author && v.statistics);
    if (!videoInfo) {
      throw new InternalServerErrorException('未找到视频信息字段');
    }
    const video = videoInfo.video;
    const author = videoInfo.author;
    const stats = videoInfo.statistics || {};

    // 优先取 play_addr(无水印 mp4)
    const playAddr: any =
      video?.play_addr ||
      video?.play_addr_lowbr ||
      video?.download_addr ||
      video?.play_addr_265;
    const videoUrl = this.pickUrl(playAddr);
    const cover = this.pickUrl(video?.cover || video?.origin_cover) || '';
    const avatar = this.pickUrl(author?.avatar?.url_list?.[0] || author?.avatar_thumb) || '';

    if (!videoUrl) {
      throw new InternalServerErrorException('未找到无水印视频地址');
    }

    return {
      title: videoInfo?.desc || author?.nickname ? `${author?.nickname || ''}的作品` : '抖音视频',
      cover,
      videoUrl,
      authorName: author?.nickname || '匿名作者',
      authorAvatar: avatar,
      likeCount: Number(stats?.digg_count || 0),
      playCount: Number(stats?.play_count || stats?.share_count || 0),
      desc: videoInfo?.desc,
    };
  }

  /** 深度遍历查找第一个满足 predicate 的节点 */
  private deepFind(node: any, predicate: (v: any) => boolean): any | null {
    if (node == null) return null;
    if (predicate(node)) return node;
    if (Array.isArray(node)) {
      for (const item of node) {
        const found = this.deepFind(item, predicate);
        if (found) return found;
      }
    } else if (typeof node === 'object') {
      for (const key of Object.keys(node)) {
        const found = this.deepFind(node[key], predicate);
        if (found) return found;
      }
    }
    return null;
  }

  /** 从抖音 url_list / url 字段中取出第一个 https URL */
  private pickUrl(field: any): string {
    if (!field) return '';
    if (typeof field === 'string') return field;
    if (Array.isArray(field)) {
      const found = field.find((u) => typeof u === 'string' && u.startsWith('http'));
      if (found) return found;
    }
    if (Array.isArray(field?.url_list)) {
      const found = field.url_list.find((u: string) => u.startsWith('http'));
      if (found) return found;
    }
    if (typeof field?.url === 'string' && field.url.startsWith('http')) {
      return field.url;
    }
    return '';
  }
}
