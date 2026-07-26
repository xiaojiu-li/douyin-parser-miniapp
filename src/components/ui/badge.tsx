import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export interface BadgeProps {
  className?: string;
  variant?: 'default' | 'secondary' | 'outline';
  children?: ReactNode;
}

const VARIANT_CLASS: Record<NonNullable<BadgeProps['variant']>, string> = {
  default: 'bg-primary text-white',
  secondary: 'bg-secondary text-black',
  outline: 'border border-[#38383a] text-white',
};

export const Badge: FC<BadgeProps> = ({ className, variant = 'default', children }) => {
  return (
    <View
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        VARIANT_CLASS[variant],
        className,
      )}
    >
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

export default Badge;
