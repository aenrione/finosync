import { View, StyleSheet, ScrollView } from "react-native"
import React, { useState, useEffect } from "react"

import CustomButton from "@/components/CustomButton"
import CustomInput from "@/components/CustomInput"

export default function SettingScreen() {
  const state = { baseUrl: "https://example.com" } // Replace with actual state management
  const [currentUrl, setUrl] = useState(state.baseUrl || "https://")

  useEffect(() => {})

  const updateUrl = async () => {
    // store.dispatch(changeUrl({ url: currentUrl }));
    // navigation.navigate('SignIn');
  }

  return (
    <ScrollView>
      <View style={styles.root}>
        <CustomButton text="Server URL" type="tertiary" />
        <CustomInput placeholder="https://" value={currentUrl} setValue={setUrl} />
        <CustomButton
          text="Update Base Url"
          bgColor="#e3e3e3"
          fgColor="#363636"
          onPress={updateUrl}
        />
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    marginTop: 30,
  },
  logo: {
    flex: 1,
    width: "70%",
    maxWidth: 300,
    maxHeight: 200,
    marginVertical: 30,
  },
})

