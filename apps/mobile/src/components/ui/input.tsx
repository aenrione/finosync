import { cn } from "@/lib/utils";
import { colors } from "@/lib/colors";
import * as React from "react";
import { TextInput, type TextInputProps } from "react-native";

interface InputProps extends TextInputProps {
  className?: string;
}

const Input = React.forwardRef<
  React.ComponentRef<typeof TextInput>,
  InputProps
>(
  (
    { className, placeholderTextColor = colors.mutedForeground, ...props },
    ref,
  ) => {
    return (
      <TextInput
        ref={ref}
        className={cn(
          "h-12 px-4 bg-card rounded-xl text-foreground text-base",
          className,
        )}
        placeholderTextColor={placeholderTextColor}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
export type { InputProps };
