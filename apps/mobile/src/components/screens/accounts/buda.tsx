import React from "react"
// import { Alert } from 'react-native';
// import { showMessage } from 'react-native-flash-message';
import axios from "axios"

import { Card, Divider, CardTitle } from "@/components/ui/card"
import CustomAmountItem from "@/components/CustomAmountItem"
import CustomButton from "@/components/CustomButton"

// const deleteAccount = async (refetch) => {
// await axios.delete('/api/v1/buda_account');
// await refetch();
// showMessage({
//   message: 'Account Deleted',
//   type: 'success',
// });
// };

// const createTwoButtonAlert = (refetch) =>
// Alert.alert('Delete Account', 'All data synced for this account will be destroyed', [
//   {
//     text: 'Cancel',
//     style: 'cancel',
//   },
//   { text: 'Delete', onPress: () => deleteAccount(refetch) },
// ]);

export function BudaAccount({ account, refetch }) {
  return (
    <Card>
      <CardTitle>Buda</CardTitle>
      <Divider />
      <CustomAmountItem text={"Balance"} value={account.balance} />
      <Divider />
      <CustomAmountItem text={"Returns"} value={account.investments_return} />
      <CustomButton
        text="Delete Account"
        fgColor="red"
        type="tertiary"
      />
    </Card>
  )
}


