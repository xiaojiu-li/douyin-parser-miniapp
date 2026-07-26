import { View } from '@tarojs/components';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export interface CardProps {
  className?: string;
  children?: ReactNode;
}

export const Card: FC<CardProps> = ({ className, children }) => {
  return (
    <View
      className={cn(
        'bg-card rounded-2xl border border-[#38383a] overflow-hidden',
        className,
      )}
    >
      {children}
    </View>
  );
};

export interface CardContentProps {
  className?: string;
  children?: ReactNode;
}

export const CardContent: FC<CardContentProps> = ({ className, children }) => {
  return <View className={cn('p-4', className)}>{children}</View>;
};

export interface CardHeaderProps {
  className?: string;
  children?: ReactNode;
}

export const CardHeader: FC<CardHeaderProps> = ({ className, children }) => {
  return <View className={cn('p-4 pb-2', className)}>{children}</View>;
};

export interface CardFooterProps {
  className?: string;
  children?: ReactNode;
}

export const CardFooter: FC<CardFooterProps> = ({ className, children }) => {
  return <View className={cn('p-4 pt-2', className)}>{children}</View>;
};

export default Card;
