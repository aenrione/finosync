import { View, Text } from "react-native"
import React from "react"

import { Category } from "@/types/category"
import Icon from "@/components/ui/icon"

type CategoryCardProps = {
  category: Category
}

const CategoryCard = ({ category }: CategoryCardProps) => (
  <View className="mt-2 ml-5 flex-row items-center bg-muted rounded-xl p-4 border border-border">
    <View className="w-10 h-10 rounded-full items-center justify-center bg-primary/10">
      <Icon name={category.icon || "CircleHelp"}/>
    </View>

    <View className="flex-1 ml-3 justify-between">
      <Text className="text-foreground text-base font-medium">{category.name}</Text>
      {category.description && (
        <Text className="text-muted-foreground text-sm mt-1">{category.description}</Text>
      )}
    </View>
  </View>
)

export default CategoryCard

