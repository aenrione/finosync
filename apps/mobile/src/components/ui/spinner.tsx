import * as React from 'react';
import { ActivityIndicator, type ActivityIndicatorProps } from 'react-native';

interface SpinnerProps extends ActivityIndicatorProps {
  className?: string;
}

function Spinner({ size = 'small', color = '#4F46E5', ...props }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} {...props} />;
}

export { Spinner };
