import { View } from "react-native";
import React from "react";

import Icon from "@/components/ui/icon";
import { Text } from "@/components/ui/text";

type StaleDataBannerProps = {
  label?: string;
  updatedAt?: string | null;
};

function formatUpdatedAt(updatedAt?: string | null) {
  if (!updatedAt) return null;

  const date = new Date(updatedAt);
  if (Number.isNaN(date.getTime())) return null;

  return date.toLocaleString();
}

export default function StaleDataBanner({
  label = "Showing your last synced data while we reconnect.",
  updatedAt,
}: StaleDataBannerProps) {
  const formattedUpdatedAt = formatUpdatedAt(updatedAt);

  return (
    <View className="flex-row rounded-2xl border border-warning/20 bg-warning/10 px-4 py-3">
      <View className="mr-3 mt-0.5 h-8 w-8 items-center justify-center rounded-full bg-warning/15">
        <Icon name="CloudAlert" size={16} className="text-warning" />
      </View>
      <View className="flex-1">
        <Text className="text-sm font-semibold text-foreground">
          Offline snapshot
        </Text>
        <Text className="mt-0.5 text-xs leading-5 text-muted-foreground">
          {label}
        </Text>
        {formattedUpdatedAt ? (
          <Text className="mt-1 text-2xs uppercase tracking-wide text-muted-foreground">
            Last synced {formattedUpdatedAt}
          </Text>
        ) : null}
      </View>
    </View>
  );
}
