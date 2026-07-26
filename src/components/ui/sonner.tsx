import Taro from '@tarojs/taro';
import { View, Text } from '@tarojs/components';
import { useEffect, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export type ToastVariant = 'default' | 'success' | 'error';

export interface ToastOptions {
  title?: string;
  content?: string;
  variant?: ToastVariant;
  duration?: number;
}

let _show: ((opts: ToastOptions) => void) | null = null;

/** 全局触发 Toast */
export function toast(opts: ToastOptions): void {
  _show?.(opts);
}

const VARIANT_CLASS: Record<ToastVariant, string> = {
  default: 'bg-card border-[#38383a]',
  success: 'bg-green-900/80 border-green-600',
  error: 'bg-red-900/80 border-red-600',
};

export const Toaster: FC = () => {
  const [visible, setVisible] = useState(false);
  const [opts, setOpts] = useState<ToastOptions>({});

  const show = useCallback((o: ToastOptions) => {
    setOpts(o);
    setVisible(true);
    const duration = o.duration ?? 2000;
    setTimeout(() => setVisible(false), duration);
    if (o.content && Taro.getEnv() === Taro.ENV_TYPE.WEAPP) {
      Taro.showToast({ title: o.content, icon: 'none', duration });
    }
  }, []);

  useEffect(() => {
    _show = show;
    return () => {
      _show = null;
    };
  }, [show]);

  if (!visible) return null;

  return (
    <View
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
      }}
      className={cn(
        'px-4 py-3 rounded-xl border min-w-40 max-w-80 text-center',
        VARIANT_CLASS[opts.variant || 'default'],
      )}
    >
      {opts.title && <Text className="block text-white text-sm font-semibold mb-1">{opts.title}</Text>}
      {opts.content && <Text className="block text-white text-xs">{opts.content}</Text>}
    </View>
  );
};

export interface SonnerProps {
  children?: ReactNode;
}

/** Sonner 兼容包装 - 提供全局 Toast 容器 */
export const Sonner: FC<SonnerProps> = () => {
  return <Toaster />;
};

export default Sonner;
