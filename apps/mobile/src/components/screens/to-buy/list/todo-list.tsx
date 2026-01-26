import { View, Text, TouchableOpacity } from "react-native"
import React from "react"

import { ToBuyItem } from "@/types/to-buy"
import Icon from "@/components/ui/icon"


interface TodoListProps {
  item: ToBuyItem
  deleteItem: (id: string | number) => void
}

const TodoList: React.FC<TodoListProps> = ({ item, deleteItem }) => (
  <View className="flex-row justify-center w-auto h-auto">
    <TouchableOpacity className="bg-gray-100 w-[350px] mb-8 rounded-xl flex-row justify-between">
      <View className="justify-center items-center pl-1">
	  <Icon name="Check" className="text-green-500" />
      </View>

      <View>
        <Text className="text-black w-[260px] text-[20px] mt-2 mr-5">
          {item.title}
        </Text>
        <Text className="text-yellow-600 text-[15px] mr-5 rounded-xl w-[100px]">
          {item.price_amount}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() => deleteItem(item.id.toString())}
        className="items-center justify-center mr-2 rounded-xl"
      >
        <Icon name="Trash" />
      </TouchableOpacity>
    </TouchableOpacity>
  </View>
)

export default TodoList

