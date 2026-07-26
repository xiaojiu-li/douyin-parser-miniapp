import { AvatarProps } from '@tarojs/components';
import { Image, View, Text } from '@tarojs/components';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import type { FC } from 'react';

export interface AvatarPropsExt extends AvatarProps {
  src?: string;
  fallback?: string;
  className?: string;
}

export const Avatar: FC<AvatarPropsExt> = ({ src, fallback, className }) => {
  const [error, setError] = useState(false);
  const showImage = src && !error;
  const showFallback = !showImage && fallback;

  return (
    <View
      className={cn(
        'relative inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-[#2a2a2c]',
        className,
      )}
    >
      {showImage && (
        <Image
          src={src}
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
          onError={() => setError(true)}
        />
      )}
      {showFallback && (
        <Text className="text-white text-sm font-medium">{fallback.slice(0, 2)}</Text>
      )}
    </View>
  );
};

export default Avatar;
