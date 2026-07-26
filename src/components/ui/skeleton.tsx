import { View } from '@tarojs/components';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

export interface SkeletonProps {
  className?: string;
}

export const Skeleton: FC<SkeletonProps> = ({ className }) => {
  return (
    <View
      className={cn('bg-[#2a2a2c] animate-pulse rounded-md', className)}
    />
  );
};

export default Skeleton;
