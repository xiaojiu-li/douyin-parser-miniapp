export interface DouyinVideoInfo {
  title: string;
  cover: string;
  videoUrl: string;
  authorName: string;
  authorAvatar: string;
  likeCount: number;
  playCount: number;
  desc?: string;
}

export interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}
