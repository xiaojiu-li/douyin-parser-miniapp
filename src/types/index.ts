export interface DouyinVideoInfo {
  /** 视频标题 */
  title: string;
  /** 视频封面图 URL */
  cover: string;
  /** 无水印视频 URL */
  videoUrl: string;
  /** 作者昵称 */
  authorName: string;
  /** 作者头像 URL */
  authorAvatar: string;
  /** 点赞数 */
  likeCount: number;
  /** 播放/分享数 */
  playCount: number;
  /** 原始分享文案 */
  desc?: string;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
