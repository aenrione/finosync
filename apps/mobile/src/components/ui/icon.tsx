import { cn } from '@/lib/utils';
import { icons, type LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import { View, type ViewProps } from 'react-native';

interface IconProps extends ViewProps {
  name?: keyof typeof icons;
  as?: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
  className?: string;
  containerClassName?: string;
}

function Icon({
  name,
  as,
  size = 20,
  color,
  strokeWidth = 2,
  className,
  containerClassName,
  ...props
}: IconProps) {
  const IconComponent = as ?? (name ? icons[name] : undefined);
  if (!IconComponent) {
    return null;
  }

  return (
    <View className={cn('items-center justify-center', containerClassName)} {...props}>
      <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={cn('text-foreground', className)}
      />
    </View>
  );
}

export default Icon;
export { Icon };
