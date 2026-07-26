import { View } from '@tarojs/components';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export interface AspectRatioProps {
  ratio?: number;
  className?: string;
  children?: ReactNode;
}

export const AspectRatio: FC<AspectRatioProps> = ({ ratio = 1, className, children }) => {
  return (
    <View
      className={cn('relative w-full overflow-hidden', className)}
      style={{ paddingBottom: `${(1 / ratio) * 100}%` }}
    >
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {children}
      </View>
    </View>
  );
};

export default AspectRatio;
