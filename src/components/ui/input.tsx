import { InputProps } from '@tarojs/components';
import { Input as TaroInput, View } from '@tarojs/components';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

export interface InputPropsExt extends InputProps {
  className?: string;
  wrapperClassName?: string;
}

/**
 * 跨端 Input 组件
 * - H5 端原生 Input 是 inline 元素,所以用 View 包裹,样式放在 View 上
 * - Input 本身只用 width:100% 透明背景
 */
export const Input: FC<InputPropsExt> = ({
  className,
  wrapperClassName,
  ...rest
}) => {
  return (
    <View className={cn('bg-input rounded-xl px-4 py-3 min-h-11 flex items-center', wrapperClassName)}>
      <TaroInput
        {...rest}
        className={cn('w-full bg-transparent text-white text-sm', className)}
        style={{ width: '100%', backgroundColor: 'transparent' }}
      />
    </View>
  );
};

export default Input;
