import { ScrollView, TextInput, Modal } from "react-native"
import { Picker } from "@react-native-picker/picker"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import CurrenciesSelect from "@/components/search-selects/currencies"
import { Text } from "@/components/ui/text"
import { View } from "react-native"
import { Button, ButtonText } from "@/components/ui/button"
import { Account } from "@/types/account"
import { useStore } from "@/utils/store"

const AddAccount = () => {
  const [type, setType] = useState([])
  const [accName, setName] = useState("")
  const [amount, setAmount] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [fintocOptions, setFintocOptions] = useState()
  const [currency, setCurrency] = useState(null)
  const [editable, setEdit] = useState(true)
  const [email, setEmail] = useState("")
  const [secret, setSecret] = useState("")
  const { t } = useTranslation()
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

  const onSuccess = async (uri) => {
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

  const onEvent = (event) => {
    const data = event.nativeEvent.data
    if (data === "fintocwidget://exit") closeModal()
    else if (data.includes("fintocwidget://succeeded")) onSuccess(data)
  }

  const setAccount = async (acc_type) => {
    if (acc_type.fintoc) {
      await getOptions(setFintocOptions, fintocOptions)
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
          <Text className="text-muted font-medium text-sm">{t("new_account.account_type")}</Text>
          <Picker
            selectedValue={type}
            onValueChange={(itemValue) => setAccount(itemValue)}
            enabled={editable && !currentAccount}
            dropdownIconColor="hsl(var(--muted-foreground))"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {accounts.map((type, index) => (
              <Picker.Item key={index} label={t(`new_account.types.${type.subtype}`)} value={type} />
            ))}
          </Picker>
        </View>

        {/* Account Name */}
        {type.subtype !== "fintual" && (editable || currentAccount) && (
          <View className="mb-5">
            <Text className="text-muted font-medium text-sm">
              {t("new_account.account_name")}
              {currentAccount && <Text className="text-success"> {t("new_account.editable")}</Text>}
            </Text>
            <TextInput
              value={accName}
              placeholder={t("new_account.name_placeholder")}
              onChangeText={setName}
              placeholderTextColor="hsl(var(--muted-foreground))"
              className="mt-2 p-3 rounded-lg text-foreground bg-muted text-base"
            />
          </View>
        )}

        {/* Currency Picker */}
        {type.editable && (
          <View className="mb-5">
            <Text className="text-muted font-medium text-sm">{t("new_account.currency")}</Text>
            <CurrenciesSelect
              value={currency}
              onChange={setCurrency}
              placeholder={t("new_account.select_currency")}
              className="mt-2"
            />
          </View>
        )}

        {/* Fintual Credentials */}
        {type.subtype === "fintual" && !currentAccount && (
          <View>
            <View className="mb-5">
              <Text className="text-muted font-medium text-sm">{t("new_account.email")}</Text>
              <TextInput
                inputMode='email'
                value={email}
                placeholder={t("new_account.email_placeholder")}
                onChangeText={setEmail}
                placeholderTextColor="hsl(var(--muted-foreground))"
                className="mt-2 p-3 rounded-lg text-foreground bg-muted text-base"
              />
            </View>
            <View className="mb-5">
              <Text className="text-muted font-medium text-sm">{t("new_account.secret")}</Text>
              <TextInput
                value={secret}
                placeholder={t("new_account.secret_placeholder")}
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
          <ButtonText>{t("save")}</ButtonText>
        </Button>
      </View>
    </View>
  )
}

export default AddAccount

