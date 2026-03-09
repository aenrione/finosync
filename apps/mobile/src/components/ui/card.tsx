import { cn } from '@/lib/utils';
import * as React from 'react';
import { View, Text, type ViewProps, type TextProps } from 'react-native';

const Card = React.forwardRef<React.ComponentRef<typeof View>, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View
      ref={ref}
      className={cn('bg-card rounded-2xl shadow-sm', className)}
      {...props}
    />
  )
);
Card.displayName = 'Card';

const CardHeader = React.forwardRef<React.ComponentRef<typeof View>, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn('p-4 pb-2', className)} {...props} />
  )
);
CardHeader.displayName = 'CardHeader';

const CardContent = React.forwardRef<React.ComponentRef<typeof View>, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn('p-4 pt-0', className)} {...props} />
  )
);
CardContent.displayName = 'CardContent';

const CardFooter = React.forwardRef<React.ComponentRef<typeof View>, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn('p-4 pt-0 flex-row items-center', className)} {...props} />
  )
);
CardFooter.displayName = 'CardFooter';

const CardTitle = React.forwardRef<React.ComponentRef<typeof Text>, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} className={cn('text-lg font-semibold text-card-foreground', className)} {...props} />
  )
);
CardTitle.displayName = 'CardTitle';

const CardDescription = React.forwardRef<React.ComponentRef<typeof Text>, TextProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <Text ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
  )
);
CardDescription.displayName = 'CardDescription';

const Divider = React.forwardRef<React.ComponentRef<typeof View>, ViewProps & { className?: string }>(
  ({ className, ...props }, ref) => (
    <View ref={ref} className={cn('h-px bg-border my-3', className)} {...props} />
  )
);
Divider.displayName = 'Divider';

export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, Divider };
