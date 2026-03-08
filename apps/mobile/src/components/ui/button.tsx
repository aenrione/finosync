import { cn } from '@/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';
import * as React from 'react';
import { Pressable, Text, type PressableProps, type TextProps } from 'react-native';

const buttonVariants = cva(
  'flex-row items-center justify-center gap-2 active:opacity-80',
  {
    variants: {
      variant: {
        default: 'bg-primary',
        secondary: 'bg-secondary',
        destructive: 'bg-destructive',
        outline: 'border border-border bg-transparent',
        ghost: 'bg-transparent',
      },
      size: {
        sm: 'h-9 px-3 rounded-lg',
        default: 'h-11 px-4 rounded-lg',
        lg: 'h-14 px-6 rounded-lg',
        icon: 'h-10 w-10 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

const buttonTextVariants = cva('font-semibold text-center', {
  variants: {
    variant: {
      default: 'text-primary-foreground',
      secondary: 'text-secondary-foreground',
      destructive: 'text-destructive-foreground',
      outline: 'text-foreground',
      ghost: 'text-foreground',
    },
    size: {
      sm: 'text-sm',
      default: 'text-base',
      lg: 'text-lg',
      icon: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'default',
  },
});

type ButtonVariantProps = VariantProps<typeof buttonVariants>;

interface ButtonProps extends PressableProps, ButtonVariantProps {
  className?: string;
}

const Button = React.forwardRef<React.ComponentRef<typeof Pressable>, ButtonProps>(
  ({ className, variant, size, disabled, ...props }, ref) => {
    return (
      <Pressable
        ref={ref}
        className={cn(
          buttonVariants({ variant, size }),
          disabled && 'opacity-50',
          className
        )}
        disabled={disabled}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

interface ButtonTextProps extends TextProps, ButtonVariantProps {
  className?: string;
}

const ButtonText = React.forwardRef<React.ComponentRef<typeof Text>, ButtonTextProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <Text
        ref={ref}
        className={cn(buttonTextVariants({ variant, size }), className)}
        {...props}
      />
    );
  }
);
ButtonText.displayName = 'ButtonText';

export { Button, ButtonText, buttonVariants, buttonTextVariants };
export type { ButtonProps };
