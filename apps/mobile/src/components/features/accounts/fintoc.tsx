import React from "react"

import { Card, Divider, CardTitle } from "@/components/ui/card"
import CustomAmountItem from "@/components/custom-amount-item"

export function FintocAccount({ account }: { account: { balance: number; income: number; expense: number } }) {
  return (
    <Card>
      <CardTitle>Fintoc</CardTitle>
      <Divider />
      <CustomAmountItem text={"Balance"} value={account.balance} />
      <Divider />
      <CustomAmountItem text={"Income"} value={account.income} />
      <Divider />
      <CustomAmountItem text={"Expense"} value={account.expense} />
    </Card>
  )
}
