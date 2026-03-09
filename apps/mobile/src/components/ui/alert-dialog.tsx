import { cn } from '@/lib/utils';
import * as React from 'react';
import { Modal, Pressable, View, type ViewProps } from 'react-native';

interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

function AlertDialog({ isOpen, onClose, children }: AlertDialogProps) {
  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View className="flex-1 items-center justify-center">
        {children}
      </View>
    </Modal>
  );
}

function AlertDialogBackdrop({ onPress }: { onPress?: () => void }) {
  if (onPress) {
    return (
      <Pressable className="absolute inset-0 bg-black/50" onPress={onPress} />
    );
  }
  return (
    <View className="absolute inset-0 bg-black/50" />
  );
}

function AlertDialogContent({ className, children, ...props }: ViewProps & { className?: string }) {
  return (
    <View
      className={cn('bg-card rounded-xl p-6 mx-6 w-full max-w-sm shadow-lg z-10', className)}
      {...props}
    >
      {children}
    </View>
  );
}

function AlertDialogHeader({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('mb-2', className)} {...props} />;
}

function AlertDialogBody({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('mb-4', className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: ViewProps & { className?: string }) {
  return <View className={cn('flex-row justify-end gap-3', className)} {...props} />;
}

export {
  AlertDialog,
  AlertDialogBackdrop,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogBody,
  AlertDialogFooter,
};
