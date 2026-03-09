import { TouchableOpacity, View } from "react-native";
import React from "react";

import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { getErrorMessage, getErrorTitle } from "@/utils/api";

type RouteErrorStateProps = {
  error: unknown;
  onRetry: () => void | Promise<void>;
  onSecondaryAction?: () => void;
  secondaryLabel?: string;
  title?: string;
};

export default function RouteErrorState({
  error,
  onRetry,
  onSecondaryAction,
  secondaryLabel = "Go back",
  title,
}: RouteErrorStateProps) {
  const handleRetry = () => {
    const result = onRetry();

    if (result && typeof (result as Promise<void>).catch === "function") {
      (result as Promise<void>).catch((retryError) => {
        console.error("Retry action failed", retryError);
      });
    }
  };

  return (
    <View className="flex-1 items-center justify-center bg-background px-6">
      <View className="h-16 w-16 items-center justify-center rounded-full bg-warning/10">
        <Icon name="CloudOff" size={30} className="text-warning" />
      </View>

      <Text className="mt-5 text-center text-2xl font-bold text-foreground">
        {title || getErrorTitle(error)}
      </Text>
      <Text className="mt-2 text-center text-sm leading-6 text-muted-foreground">
        {getErrorMessage(error)}
      </Text>

      <View className="mt-6 w-full gap-3">
        <TouchableOpacity
          className="items-center rounded-2xl bg-primary px-5 py-3.5"
          activeOpacity={0.85}
          onPress={handleRetry}
        >
          <Text className="text-sm font-semibold text-primary-foreground">
            Try again
          </Text>
        </TouchableOpacity>

        {onSecondaryAction ? (
          <TouchableOpacity
            className="items-center rounded-2xl border border-border bg-card px-5 py-3.5"
            activeOpacity={0.85}
            onPress={onSecondaryAction}
          >
            <Text className="text-sm font-semibold text-foreground">
              {secondaryLabel}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}
