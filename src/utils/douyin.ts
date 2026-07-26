import { Network } from '@/network';
import type { ApiResponse, DouyinVideoInfo } from '@/types';

/**
 * 调用后端解析抖音链接
 * @param shareText 抖音分享文本(含短链)
 */
export async function parseDouyinLink(shareText: string): Promise<DouyinVideoInfo> {
  const res = await Network.request<ApiResponse<DouyinVideoInfo>>({
    url: '/api/douyin/parse',
    method: 'POST',
    data: { text: shareText },
    header: { 'Content-Type': 'application/json' },
  });
  if (res.code !== 0) {
    throw new Error(res.msg || '解析失败');
  }
  return res.data;
}

/** 从抖音分享文本中提取 URL */
export function extractUrl(text: string): string | null {
  if (!text) return null;
  // 匹配 http(s):// 链接
  const match = text.match(/https?:\/\/[^\s,，。]+/);
  return match ? match[0] : null;
}

/** 复制文本到剪贴板 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    const { Taro } = await import('@tarojs/taro');
    await Taro.setClipboardData({ data: text });
    return true;
  } catch {
    return false;
  }
}

/** 数字格式化,如 1.2w */
export function formatCount(n: number): string {
  if (!n || n <= 0) return '0';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}w`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
