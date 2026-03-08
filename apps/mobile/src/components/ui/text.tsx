import { cn } from '@/lib/utils';
import * as React from 'react';
import { Text as RNText, type TextProps } from 'react-native';

const Text = React.forwardRef<React.ComponentRef<typeof RNText>, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <RNText ref={ref} className={cn('text-base text-foreground', className)} {...props} />
  )
);
Text.displayName = 'Text';

export { Text };
