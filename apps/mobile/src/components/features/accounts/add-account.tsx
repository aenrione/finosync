import { ScrollView, TextInput, Modal } from "react-native"
import { Picker } from "@react-native-picker/picker"
import React, { useEffect, useState } from "react"
import { useTranslation } from "@/locale/app/add-account.text"

import CurrenciesSelect from "@/components/search-selects/currencies"
import { Text } from "@/components/ui/text"
import { View } from "react-native"
import { Button, ButtonText } from "@/components/ui/button"
import { Account } from "@/types/account"
import { useStore } from "@/utils/store"

const AddAccount = () => {
  const [type, setType] = useState<any>({})
  const [accName, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [fintocOptions, setFintocOptions] = useState<any>(null)
  const [currency, setCurrency] = useState<string | null>(null)
  const [editable, setEdit] = useState(true)
  const [email, setEmail] = useState("")
  const [secret, setSecret] = useState("")
  const text = useTranslation()
  const currentAccount = useStore((state) => state.currentAccount)
  const accounts: Account[] = []

  const isValid = () => (type.editable ? accName !== "" : true)

  const closeModal = () => {
    setShowModal(false)
    // setFintocOptions(null);
    // setType(accounts[0]);
  }

  const createFintual = async () => {
    // try {
    //   const token = await getToken(email, secret);
    //   const goals = await getGoals(email, token);
    //   await createFintualAccounts(goals, email, secret, type);
    // } catch {
    //   console.error("ERROR");
    // }
  }

  const onSuccess = async (uri: string) => {
    // const queryString = uri.split('?')[1];
    // const params = {};
    // queryString.split('&').forEach((param) => {
    //   const [key, value] = param.split('=');
    //   params[key] = value;
    // });
    //
    // const exchangeToken = params["exchange_token"];
    // const link = await getLink(exchangeToken);
    // // const accounts = await linkInfo(link);
    // // await createAccounts(accounts, type);
    // navigation.goBack();
    closeModal()
  }

  const onEvent = (event: any) => {
    const data = event.nativeEvent.data
    if (data === "fintocwidget://exit") closeModal()
    else if (data.includes("fintocwidget://succeeded")) onSuccess(data)
  }

  const setAccount = async (acc_type: any) => {
    if (acc_type.fintoc) {
      // TODO: implement getOptions
      setShowModal(true)
    }
    setType(acc_type)
  }

  const __save = () => {
    // if (type.subtype === "fintual") {
    //   createFintual();
    // } else {
    //   route.params?.item ? __update() : __insert();
    // }
    // dispatch(getAllInfo());
    // navigation.goBack();
  }

  return (
    <View className="flex-1 bg-background">
      <ScrollView className="flex-1 px-5 pt-2" showsVerticalScrollIndicator={false}>
        {/* Account Type */}
        <View className="mb-5">
          <Text className="text-muted font-medium text-sm">{text.accountType}</Text>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setAccount(itemValue)}
            enabled={editable && !currentAccount}
            dropdownIconColor="hsl(var(--muted-foreground))"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {accounts.map((type, index) => (
              <Picker.Item key={index} label={text.types[(type as any).subtype as keyof typeof text.types] ?? (type as any).subtype} value={type} />
            ))}
          </Picker>
        </View>

        {/* Account Name */}
        {type.subtype !== "fintual" && (editable || currentAccount) && (
          <View className="mb-5">
            <Text className="text-muted font-medium text-sm">
              {text.accountName}
              {currentAccount && <Text className="text-success"> {text.editable}</Text>}
            </Text>
            <TextInput
              value={accName}
              placeholder={text.namePlaceholder}
              onChangeText={setName}
              placeholderTextColor="hsl(var(--muted-foreground))"
              className="mt-2 p-3 rounded-lg text-foreground bg-muted text-base"
            />
          </View>
        )}

        {/* Currency Picker */}
        {type.editable && (
          <View className="mb-5">
            <Text className="text-muted font-medium text-sm">{text.currency}</Text>
            <CurrenciesSelect
              value={currency}
              onChange={setCurrency}
              placeholder={text.selectCurrency}
              className="mt-2"
            />
          </View>
        )}

        {/* Fintual Credentials */}
        {type.subtype === "fintual" && !currentAccount && (
          <View>
            <View className="mb-5">
              <Text className="text-muted font-medium text-sm">{text.email}</Text>
              <TextInput
                inputMode='email'
                value={email}
                placeholder={text.emailPlaceholder}
                onChangeText={setEmail}
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="mt-2 p-3 rounded-lg text-foreground bg-muted text-base"
              />
            </View>
            <View className="mb-5">
              <Text className="text-muted font-medium text-sm">{text.secret}</Text>
              <TextInput
                value={secret}
                placeholder={text.secretPlaceholder}
                secureTextEntry
                onChangeText={setSecret}
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="mt-2 p-3 rounded-lg text-foreground bg-muted text-base"
              />
            </View>
          </View>
        )}

        {/* Fintoc Modal */}
        <Modal visible={showModal} animationType="slide" onRequestClose={closeModal}>
          <View className="flex-1 bg-muted">
            <ScrollView contentContainerStyle={{ flexGrow: 1, alignItems: "center", justifyContent: "center" }}>
              {fintocOptions && (
                <View className="w-full h-full">
                </View>
              )}
            </ScrollView>
          </View>
        </Modal>
      </ScrollView>

      <View className="p-5">
        <Button disabled={!isValid()} onPress={__save}>
          <ButtonText>{text.save}</ButtonText>
        </Button>
      </View>
    </View>
  )
}

export default AddAccount

