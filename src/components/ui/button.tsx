import { ButtonProps as TaroButtonProps } from '@tarojs/components';
import { View, Text } from '@tarojs/components';
import { cn } from '@/lib/utils';
import type { FC, ReactNode } from 'react';

export interface ButtonProps extends Omit<TaroButtonProps, 'size' | 'type'> {
  variant?: 'default' | 'outline' | 'ghost' | 'secondary' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  children?: ReactNode;
  className?: string;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-primary text-white border-0',
  outline: 'bg-transparent text-white border border-[#38383a]',
  ghost: 'bg-transparent text-white border-0',
  secondary: 'bg-secondary text-black border-0',
  destructive: 'bg-red-600 text-white border-0',
};

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'h-8 px-3 text-xs rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
  icon: 'h-10 w-10 rounded-lg',
};

export const Button: FC<ButtonProps> = ({
  variant = 'default',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  onClick,
  ...rest
}) => {
  const handleClick: TaroButtonProps['onClick'] = (e) => {
    if (loading || disabled) return;
    onClick?.(e);
  };
  return (
    <View
      {...rest}
      onClick={handleClick}
      className={cn(
        'inline-flex items-center justify-center font-medium active:opacity-80 transition-opacity',
        VARIANT_CLASS[variant],
        SIZE_CLASS[size],
        (disabled || loading) && 'opacity-50 pointer-events-none',
        className,
      )}
    >
      {loading && (
        <View className="mr-2 h-3 w-3 border border-white border-t-transparent rounded-full animate-spin" />
      )}
      {typeof children === 'string' || typeof children === 'number' ? (
        <Text>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
};

export default Button;
