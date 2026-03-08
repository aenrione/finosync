import React from "react"

import { View } from "react-native"
import { Text } from "@/components/ui/text"
import { cn } from "@/lib/utils"

import IconCard from "./icon-card"

type IconCardProps = {
  iconName: string;
  title: string;
  description?: string;
  iconClass?: string;
  iconCardClass?: string;
  className?: string;
  secondary?: boolean;
};

export default function IconTextCard({ iconName, iconClass, iconCardClass, className, title, description, secondary }: IconCardProps) {
  return (
    <View className={cn("flex flex-row items-center bg-background p-4 m-2 shadow rounded-lg ", className)}>
      <IconCard iconName={iconName} iconClass={iconClass} className={iconCardClass} />

      <View className="flex flex-col items-start text-start ml-3 mb-2">
        {
          secondary ? (
            <>
              <Text className="text-md mt-2 text-muted-foreground">{title}</Text>
              {description && <Text className="text-center text-lg font-semibold mt-1">{description}</Text>}
            </>
          ) : (
            <>
              <Text className="text-lg font-semibold">{title}</Text>
              {description && <Text className="text-md text-muted-foreground">{description}</Text>}
            </>
          )
        }
      </View>
    </View>
  )
}



