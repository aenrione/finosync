import { cn } from '@/lib/utils';
import * as React from 'react';
import { TextInput, type TextInputProps } from 'react-native';

interface InputProps extends TextInputProps {
  className?: string;
}

const Input = React.forwardRef<React.ComponentRef<typeof TextInput>, InputProps>(
  ({ className, ...props }, ref) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          'h-11 px-3 border border-border rounded-lg bg-input text-foreground text-base',
          className
        )}
        placeholderClassName="text-muted-foreground"
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
export type { InputProps };
