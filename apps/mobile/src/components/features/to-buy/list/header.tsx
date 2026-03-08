import { View, Text } from "react-native"
import React from "react"

import Amount from "@/components/custom-amount-item"
import { ToBuyList } from "@/types/to-buy"

interface HeaderProps {
  list: ToBuyList
}

const Header: React.FC<HeaderProps> = ({ list }) => (
  <View className="flex-col justify-between px-[10%] mt-5 mb-5">
    <Text className="text-foreground text-center text-[30px] mb-2">
      {list.title}
    </Text>
    <Amount text="User Monthly Remaining" value={list.user_remaining} />
    <Amount text="Remaining to expend" value={list.expense_remaining} />
    <Amount text="Total in list" value={list.total} />
  </View>
)

export default Header

