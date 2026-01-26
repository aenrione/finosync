import { View, Image, ScrollView } from "react-native"
import React, { useState, useEffect } from "react"
import { useTranslation } from "react-i18next"
import { useRouter } from "expo-router"

import { checkSession } from "@/services/auth.service"
import CustomInput from "@/components/CustomInput"
import { Button } from "@/components/ui/button"
import { login } from "@/services/auth.service"
import Logo from "@/assets/images/wallet.png"
import { useStore } from "@/utils/store"


export function SignInScreen() {
  const {t} = useTranslation()
  const url = useStore((state) => state.url)
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [currentUrl, setUrl] = useState(url)
  const [buttonStatus, setButtonStatus] = useState(false)
  const { setUrl: setStoreUrl } = useStore.getState()
  const router = useRouter()

  useEffect(() => {
    const init = async () => {
      setIsLoading(true)
      const user = await checkSession()
      if (user) {
        router.replace("/(app)/(drawer)/(tabs)/dashboard")
      } 
      setIsLoading(false)
    }
    init()

  }, [router])

  useEffect(() => {
    setUrl(url)
    if (url === "https://" || url === "") {
      setButtonStatus(false)
    }
  }, [url])

  useEffect(() => {
    if (email === "" || password === "") {
      setButtonStatus(false)
    } else {
      setButtonStatus(true)
    }
  }, [email, password])

  const onSignInPressed = async function () {
    const result = await login(email, password)
    if (!result.success) {
      // show toast / feedback
      console.warn(result.error)
    }
  }

  const onNoAccountPressed = function () {
    router.navigate("/sign-up")
  }

  const updateUrl = async () => {
    setStoreUrl(currentUrl)
    if (router) router.navigate("/(auth)/settings")
  }

  const onForgotPasswordPressed = () => {
    router.navigate("/forgot-password")
  }

  const onSignUpPressed = () => {
    if (router) router.navigate("/(auth)/sign-up")
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <Image source={Logo} className="flex-1 w-[70%] h-20 max-w-[300px] max-h-[200px]" resizeMode="contain" />
      </View>
    )
  }

  return (
    <ScrollView>
      <View>
        <View className="flex-1 items-center p-4 mt-5">
          <Image
            source={Logo}
            className="flex-1 w-[70%] max-w-[300px] max-h-[200px] my-2"
            resizeMode="contain"
          />
          <CustomInput placeholder="Email" value={email} setValue={setEmail} />
          <CustomInput
            placeholder="Password"
            secureTextEntry
            value={password}
            setValue={setPassword}
            onSubmitEditing={onSignInPressed}
          />
          <Button title={t("signin_view.sign_in")} disabled={!buttonStatus} onPress={onSignInPressed} />
          { currentUrl === "https://" || currentUrl === "" && (
            <Button title="Server URL can't be empty" variant="ghost" />
          )}

          <Button title={t("signin_view.no_account")} variant="ghost" onPress={onNoAccountPressed}/>
          <Button title={t("signin_view.forgot_password")} action="tertiary" variant="ghost" onPress={onNoAccountPressed}/>
        </View>
        <Button title="Server URL" variant="ghost"/>
        <Button title={currentUrl}  onPress={updateUrl} variant="ghost"/>
      </View>
    </ScrollView>
  )
}

export default SignInScreen
