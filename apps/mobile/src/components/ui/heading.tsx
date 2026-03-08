import { cn } from '@/lib/utils';
import * as React from 'react';
import { Text, type TextProps } from 'react-native';

interface HeadingProps extends TextProps {
  className?: string;
}

const Heading = React.forwardRef<React.ComponentRef<typeof Text>, HeadingProps>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} className={cn('text-2xl font-bold text-foreground', className)} {...props} />
  )
);
Heading.displayName = 'Heading';

export { Heading };
