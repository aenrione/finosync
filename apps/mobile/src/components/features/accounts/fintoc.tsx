import React from "react"
// import { Alert } from 'react-native';
// import { showMessage } from 'react-native-flash-message';
import axios from "axios"

import { Card, Divider, CardTitle } from "@/components/ui/card"
import { Button, ButtonText } from "@/components/ui/button"
import CustomAmountItem from "@/components/custom-amount-item"

// const deleteAccount = async (refetch) => {
//   await axios.delete('/api/v1/fintoc_account');
//   await refetch();
//   // showMessage({
//   //   message: 'Account Deleted',
//   //   type: 'success',
//   // });
// };
//
// const createTwoButtonAlert = (refetch) =>
//   Alert.alert('Delete Account', 'All data synced for this account will be destroyed', [
//     {
//       text: 'Cancel',
//       style: 'cancel',
//     },
//     { text: 'Delete', onPress: () => deleteAccount(refetch) },
//   ]);
//
export function FintocAccount({ account, refetch }) {
  return (
    <Card>
      <CardTitle>Fintoc</CardTitle>
      <Divider />
      <CustomAmountItem text={"Balance"} value={account.balance} />
      <Divider />
      <CustomAmountItem text={"Income"} value={account.income} />
      <Divider />
      <CustomAmountItem text={"Expense"} value={account.expense} />
      <Button
        variant="ghost"
        // onPress={() => createTwoButtonAlert(refetch)}
      >
        <ButtonText className="text-destructive">Delete Account</ButtonText>
      </Button>
    </Card>
  )
}
