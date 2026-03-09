import React from "react";
import { View } from "react-native";
import { icons } from "lucide-react-native";
import { cn } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import Icon from "./icon";

type StatCardProps = {
  iconName: keyof typeof icons;
  iconClass?: string;
  label: string;
  value: string | number;
  subValue?: string;
  className?: string;
};

export default function StatCard({
  iconName,
  iconClass = "text-primary",
  label,
  value,
  subValue,
  className,
}: StatCardProps) {
  return (
    <View
      className={cn(
        "flex-1 bg-card rounded-xl p-4 border border-border items-center justify-between",
        className,
      )}
    >
      <View className="items-center">
        <Icon name={iconName} className={cn("mb-2", iconClass)} size={20} />
        <Text
          className="text-xs text-muted-foreground mb-1"
          numberOfLines={1}
        >
          {label}
        </Text>
      </View>
      <Text
        className="text-base font-mono font-bold text-foreground"
        numberOfLines={1}
        adjustsFontSizeToFit
      >
        {value}
      </Text>
      {subValue ? (
        <Text
          className="text-[10px] text-muted-foreground mt-1"
          numberOfLines={1}
          adjustsFontSizeToFit
        >
          {subValue}
        </Text>
      ) : null}
    </View>
  );
}
