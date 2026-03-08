import { icons } from "lucide-react-native"
import React from "react"

import { View } from "react-native"
import { cn } from "@/lib/utils"

import Icon from "./icon"

type IconCardProps = {
  iconName: string;
  iconClass?: string;
  className?: string;
};

export default function IconCard({ iconName, iconClass, className }: IconCardProps) {
  return (
    <View className={cn("flex w-16 h-16 bg-primary/40 items-center justify-center rounded-lg", className)}>
      <Icon  name={iconName as keyof typeof icons} className={iconClass} />
    </View>
  )
}


