import { useState, useCallback } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { Link2, Download, Heart, Play, ClipboardPaste, Sparkles } from 'lucide-react-taro';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Sonner, toast } from '@/components/ui/sonner';
import { parseDouyinLink, extractUrl, copyToClipboard, formatCount } from '@/utils/douyin';
import type { DouyinVideoInfo } from '@/types';
import './index.css';

const HISTORY_KEY = 'douyin_history';
const MAX_HISTORY = 5;

interface HistoryItem {
  title: string;
  cover: string;
  videoUrl: string;
  authorName: string;
  ts: number;
}

function loadHistory(): HistoryItem[] {
  try {
    const raw = Taro.getStorageSync(HISTORY_KEY);
    if (!raw) return [];
    const arr = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveHistory(items: HistoryItem[]): void {
  try {
    Taro.setStorageSync(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
  } catch (e) {
    console.warn('保存历史失败', e);
  }
}

export default function Index() {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DouyinVideoInfo | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>(() => loadHistory());

  const handleParse = useCallback(async () => {
    const url = extractUrl(text);
    if (!url) {
      toast({ title: '提示', content: '请粘贴抖音分享链接', variant: 'error' });
      return;
    }
    setLoading(true);
    setResult(null);
    try {
      const info = await parseDouyinLink(text);
      setResult(info);
      toast({ title: '解析成功', content: info.title, variant: 'success' });
      const newHistory: HistoryItem[] = [
        {
          title: info.title,
          cover: info.cover,
          videoUrl: info.videoUrl,
          authorName: info.authorName,
          ts: Date.now(),
        },
        ...history.filter((h) => h.videoUrl !== info.videoUrl),
      ].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (e: any) {
      toast({
        title: '解析失败',
        content: e?.message || '请检查链接是否正确',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [text, history]);

  const handlePaste = useCallback(async () => {
    try {
      const data = await Taro.getClipboardData();
      if (data?.data) {
        setText(data.data);
        toast({ content: '已粘贴', variant: 'success' });
      }
    } catch {
      toast({ content: '获取剪贴板失败', variant: 'error' });
    }
  }, []);

  const handleCopyLink = useCallback(async () => {
    if (!result?.videoUrl) return;
    const ok = await copyToClipboard(result.videoUrl);
    toast({
      content: ok ? '无水印链接已复制' : '复制失败',
      variant: ok ? 'success' : 'error',
    });
  }, [result]);

  const handleWatch = useCallback(() => {
    if (!result?.videoUrl) return;
    if (Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      Taro.previewMedia({ sources: [{ url: result.videoUrl, type: 'video' }] }).catch(() => {
        toast({ content: '无法在此环境播放视频', variant: 'error' });
      });
    } else {
      copyToClipboard(result.videoUrl);
      toast({ content: '视频链接已复制,可在浏览器打开', variant: 'success' });
    }
  }, [result]);

  const handleClear = useCallback(() => {
    setText('');
    setResult(null);
  }, []);

  const handleHistoryClick = useCallback((item: HistoryItem) => {
    setText(item.videoUrl);
    setResult({
      title: item.title,
      cover: item.cover,
      videoUrl: item.videoUrl,
      authorName: item.authorName,
      authorAvatar: '',
      likeCount: 0,
      playCount: 0,
    });
  }, []);

  return (
    <View className="min-h-screen bg-background px-4 pt-12 pb-16">
      <Sonner />

      {/* 顶部品牌区 */}
      <View className="flex flex-col items-center mb-8">
        <View className="flex items-center mb-2">
          <Sparkles size={24} color="#fe2c55" strokeWidth={2} className="mr-2" />
          <Text className="block text-xl font-bold text-white">抖音解析</Text>
        </View>
        <Text className="block text-sm text-[#a0a0a0]">粘贴分享链接,一键解析无水印视频</Text>
      </View>

      {/* 输入区 */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <Input
            value={text}
            onInput={(e) => setText(e.detail.value)}
            placeholder="粘贴抖音分享文本..."
            maxlength={500}
            wrapperClassName="mb-3 min-h-20"
          />
          <View className="flex flex-row gap-2">
            <Button variant="outline" size="md" onClick={handlePaste} className="flex-1">
              <ClipboardPaste size={16} color="#ffffff" className="mr-1" />
              <Text>粘贴</Text>
            </Button>
            <Button
              variant="default"
              size="md"
              loading={loading}
              onClick={handleParse}
              className="flex-1"
            >
              <Link2 size={16} color="#ffffff" className="mr-1" />
              <Text>解析</Text>
            </Button>
          </View>
        </CardContent>
      </Card>

      {/* 加载骨架 */}
      {loading && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <Skeleton className="w-full h-48 mb-3" />
            <Skeleton className="w-3/4 h-4 mb-2" />
            <Skeleton className="w-1/2 h-3 mb-4" />
            <View className="flex flex-row gap-2">
              <Skeleton className="flex-1 h-10" />
              <Skeleton className="flex-1 h-10" />
            </View>
          </CardContent>
        </Card>
      )}

      {/* 结果展示 */}
      {result && !loading && (
        <Card className="mb-4 animate-in fade-in">
          <CardContent className="p-4">
            <AspectRatio ratio={9 / 16} className="rounded-xl overflow-hidden mb-3 bg-[#2a2a2c]">
              <Image
                src={result.cover}
                mode="aspectFill"
                style={{ width: '100%', height: '100%' }}
              />
            </AspectRatio>

            <Text className="block text-base font-semibold text-white mb-3">
              {result.title}
            </Text>

            <View className="flex flex-row items-center mb-3">
              <Avatar src={result.authorAvatar} fallback={result.authorName} className="w-8 h-8 mr-2" />
              <Text className="block text-sm text-[#a0a0a0]">{result.authorName}</Text>
            </View>

            <View className="flex flex-row gap-2 mb-4">
              <Badge variant="outline" className="mr-2">
                <Heart size={12} color="#fe2c55" className="mr-1" />
                <Text>{formatCount(result.likeCount)}</Text>
              </Badge>
              <Badge variant="outline">
                <Play size={12} color="#25f4ee" className="mr-1" />
                <Text>{formatCount(result.playCount)}</Text>
              </Badge>
            </View>

            <View className="flex flex-row gap-2">
              <Button variant="default" size="md" onClick={handleWatch} className="flex-1">
                <Play size={16} color="#ffffff" className="mr-1" />
                <Text>观看视频</Text>
              </Button>
              <Button variant="secondary" size="md" onClick={handleCopyLink} className="flex-1">
                <Download size={16} color="#000000" className="mr-1" />
                <Text>复制无水印</Text>
              </Button>
            </View>
          </CardContent>
        </Card>
      )}

      {/* 历史记录 */}
      {history.length > 0 && (
        <View>
          <View className="flex flex-row items-center justify-between mb-2">
            <Text className="block text-sm font-semibold text-white">最近解析</Text>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHistory([]);
                saveHistory([]);
              }}
            >
              <Text className="text-[#a0a0a0]">清空</Text>
            </Button>
          </View>
          <View className="space-y-2">
            {history.map((item, idx) => (
              <Card
                key={`${item.ts}-${idx}`}
                onClick={() => handleHistoryClick(item)}
              >
                <CardContent className="p-2">
                  <View className="flex flex-row items-center">
                    <Image
                      src={item.cover}
                      mode="aspectFill"
                      className="w-16 h-16 rounded-md mr-3"
                      style={{ width: '64px', height: '64px' }}
                    />
                    <View className="flex-1 min-w-0">
                      <Text className="block text-sm text-white truncate">{item.title}</Text>
                      <Text className="block text-xs text-[#6b6b6b] mt-1">{item.authorName}</Text>
                    </View>
                  </View>
                </CardContent>
              </Card>
            ))}
          </View>
        </View>
      )}

      {/* 底部说明 */}
      <View className="mt-8 text-center">
        <Text className="block text-xs text-[#6b6b6b]">
          仅供学习交流使用,请勿用于商业用途
        </Text>
      </View>
    </View>
  );
}
