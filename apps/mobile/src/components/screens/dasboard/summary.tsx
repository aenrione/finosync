import React, { useState } from "react"

import { Card, Divider, CardTitle } from "@/components/ui/card"
import CustomAmountItem from "@/components/CustomAmountItem"
import { View, Text } from "@/components/theme/Themed"
import { User } from "@/types/user"

type SummaryCardProps = {
  user: User
}

const SummaryCard = function ({ user }: SummaryCardProps) {
  const [eye, setEye] = useState(false)
  const hiddenText = "•••••••"

  const getValue = (value) => {
    if (eye) {
      return value
    }
    return hiddenText
  }

  if (!user) {
    return null
  }

  return (
    <Card>
      <CardTitle>Summary</CardTitle>
      <View className="flex-row justify-end items-center mb-2">
        {/*<IconButton icon={eye ? "eye" : "eye-off"} size={25} onPress={() => setEye(!eye)} /> */}
      </View>
      <Divider />
      <CustomAmountItem text={"Net Worth"} value={getValue(user.balances.total)} />
      <Divider />
      <CustomAmountItem text={"Fintoc"} value={getValue(user.balances.fintoc)} />
      <Divider />
      <CustomAmountItem text={"Buda"} value={getValue(user.balances.buda)} />
      <Divider />
      <CustomAmountItem text={"Fintual"} value={getValue(user.balances.fintual)} />
      <Divider />
      <CustomAmountItem text={"Income"} value={getValue(user.income)} />
      <Divider />
      <CustomAmountItem text={"Expense"} value={getValue(user.expense)} />
      <Divider />
      <CustomAmountItem text={"Investments"} value={getValue(user.investments_return)} />
      <Divider />
      <CustomAmountItem text={"Quota"} value={getValue(user.quota)} />
      <Divider />
      <CustomAmountItem text={"Quota remaining"} value={getValue(user.remaining)} />
    </Card>
  )
}

export default function Summary({ user } : { user: User }) {
  if (!user) {
    return <Text className="text-lg" >Loading...</Text>
  }
  return (
    <View>
      <Text className="text-2xl font-bold mb-4" >{user.name}</Text>
      <Text style={{ textAlign: "center" }} className="text-lg mb-4" >{user.email}</Text>
      {user !== null && <SummaryCard user={user} />}
    </View>
  )
}

