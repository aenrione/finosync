import AsyncStorage from "@react-native-async-storage/async-storage"
import * as SecureStore from "expo-secure-store"
import { Platform } from "react-native"

const key = "session_token"

export const getToken = async (): Promise<string | null> => {
  if (Platform.OS === "web") {
    return await AsyncStorage.getItem(key)
  } else {
    return await SecureStore.getItemAsync(key)
  }
}

export const setToken = async (v: string): Promise<void> => {
  if (Platform.OS === "web") {
    await AsyncStorage.setItem(key, v)
  } else {
    await SecureStore.setItemAsync(key, v)
  }
}

export const deleteToken = async (): Promise<void> => {
  if (Platform.OS === "web") {
    await AsyncStorage.removeItem(key)
  } else {
    await SecureStore.deleteItemAsync(key)
  }
}
