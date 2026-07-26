import Taro from '@tarojs/taro';

/**
 * Network 封装层
 * 自动拼接 PROJECT_DOMAIN,提供 request / uploadFile / downloadFile 三个方法
 * 禁止修改此文件,业务侧请直接使用:import { Network } from '@/network'
 */

interface RequestOptions<T = unknown> extends Omit<Taro.request.Option, 'success' | 'fail'> {
  url: string;
}

interface UploadFileOptions extends Omit<Taro.uploadFile.Option, 'success' | 'fail' | 'url'> {
  url: string;
}

interface DownloadFileOptions extends Omit<Taro.downloadFile.Option, 'success' | 'fail' | 'url'> {
  url: string;
}

function buildUrl(url: string): string {
  const isExternal = url.startsWith('http://') || url.startsWith('https://');
  if (isExternal) {
    return url;
  }
  const domain = (typeof PROJECT_DOMAIN !== 'undefined' ? PROJECT_DOMAIN : '') || '';
  return `${domain}${url}`;
}

class NetworkImpl {
  async request<T = unknown>(options: RequestOptions<T>): Promise<T> {
    const fullUrl = buildUrl(options.url);
    const res = await Taro.request({
      ...options,
      url: fullUrl,
    });
    if (res.statusCode < 200 || res.statusCode >= 300) {
      throw new Error(`请求失败:${res.statusCode}`);
    }
    return res.data as T;
  }

  async uploadFile(options: UploadFileOptions): Promise<Taro.uploadFile.SuccessCallbackResult> {
    const fullUrl = buildUrl(options.url);
    return Taro.uploadFile({
      ...options,
      url: fullUrl,
    });
  }

  async downloadFile(options: DownloadFileOptions): Promise<Taro.downloadFile.SuccessCallbackResult> {
    const fullUrl = buildUrl(options.url);
    return Taro.downloadFile({
      ...options,
      url: fullUrl,
    });
  }
}

export const Network = new NetworkImpl();
