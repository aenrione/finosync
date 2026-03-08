import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react-native';
import * as React from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  Text,
  View,
  type ViewProps,
} from 'react-native';

// Context for select state
interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  setLabel: (label: string) => void;
}

const SelectContext = React.createContext<SelectContextValue>({
  value: '',
  onValueChange: () => {},
  label: '',
  isOpen: false,
  setIsOpen: () => {},
  setLabel: () => {},
});

interface SelectProps {
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

function Select({ defaultValue = '', onValueChange, className, children }: SelectProps) {
  const [value, setValue] = React.useState(defaultValue);
  const [label, setLabel] = React.useState('');
  const [isOpen, setIsOpen] = React.useState(false);

  const handleValueChange = (newValue: string) => {
    setValue(newValue);
    onValueChange?.(newValue);
  };

  return (
    <SelectContext.Provider value={{ value, onValueChange: handleValueChange, label, isOpen, setIsOpen, setLabel }}>
      <View className={className}>{children}</View>
    </SelectContext.Provider>
  );
}

interface SelectTriggerProps extends ViewProps {
  variant?: string;
  size?: string;
  className?: string;
}

function SelectTrigger({ className, children, ...props }: SelectTriggerProps) {
  const { setIsOpen } = React.useContext(SelectContext);
  return (
    <Pressable
      onPress={() => setIsOpen(true)}
      className={cn(
        'h-11 flex-row items-center border border-border rounded-lg bg-input px-3',
        className
      )}
      {...props}
    >
      {children}
    </Pressable>
  );
}

function SelectInput({ placeholder }: { placeholder?: string }) {
  const { label } = React.useContext(SelectContext);
  return (
    <Text className={cn('flex-1 text-base', label ? 'text-foreground' : 'text-muted-foreground')}>
      {label || placeholder}
    </Text>
  );
}

function SelectIcon({ as: IconComponent, className }: { as: LucideIcon; className?: string }) {
  return (
    <View className={cn(className)}>
      <IconComponent size={16} className="text-muted-foreground" />
    </View>
  );
}

function SelectPortal({ children }: { children: React.ReactNode }) {
  const { isOpen, setIsOpen } = React.useContext(SelectContext);
  return (
    <Modal visible={isOpen} transparent animationType="slide" onRequestClose={() => setIsOpen(false)}>
      <View className="flex-1 justify-end">
        {children}
      </View>
    </Modal>
  );
}

function SelectBackdrop() {
  const { setIsOpen } = React.useContext(SelectContext);
  return (
    <Pressable className="absolute inset-0 bg-black/50" onPress={() => setIsOpen(false)} />
  );
}

function SelectContent({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('bg-card rounded-t-xl max-h-96 pb-8', className)}
      {...props}
    >
      {children}
    </View>
  );
}

function SelectDragIndicatorWrapper({ children }: { children: React.ReactNode }) {
  return <View className="items-center py-3">{children}</View>;
}

function SelectDragIndicator() {
  return <View className="w-10 h-1 bg-border rounded-full" />;
}

interface SelectItemProps {
  value: string;
  label: string;
}

function SelectItem({ value, label }: SelectItemProps) {
  const { onValueChange, setIsOpen, setLabel, value: currentValue } = React.useContext(SelectContext);
  const isSelected = currentValue === value;

  return (
    <Pressable
      onPress={() => {
        onValueChange(value);
        setLabel(label);
        setIsOpen(false);
      }}
      className={cn(
        'px-4 py-3 flex-row items-center',
        isSelected && 'bg-primary/10'
      )}
    >
      <Text className={cn('text-base text-foreground', isSelected && 'text-primary font-semibold')}>
        {label}
      </Text>
    </Pressable>
  );
}

export {
  Select,
  SelectTrigger,
  SelectInput,
  SelectIcon,
  SelectPortal,
  SelectBackdrop,
  SelectContent,
  SelectDragIndicatorWrapper,
  SelectDragIndicator,
  SelectItem,
};
