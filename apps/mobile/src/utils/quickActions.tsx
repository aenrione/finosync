import {
  View,
  TouchableOpacity,
} from "react-native"
import React from "react"

import Icon from "@/components/ui/icon"

const QuickActions = (item, updateItem, deleteItem, canDelete = true) => (
  <View className="flex-1 my-2.5 flex-row justify-end">
    <View className="w-[60px] rounded-2xl items-center justify-center ml-2.5 bg-green-600">
      <TouchableOpacity onPress={() => updateItem(item)}>
        <Icon name="Pencil" className="text-primary-foreground" size={15} />
      </TouchableOpacity>
    </View>
    {canDelete && (
      <View className="w-[60px] rounded-2xl items-center justify-center ml-2.5 bg-destructive">
        <TouchableOpacity onPress={() => deleteItem(item.id)}>
          <Icon name="Trash" className="text-primary-foreground" size={15} />
        </TouchableOpacity>
      </View>
    )}
  </View>
)

export default QuickActions
