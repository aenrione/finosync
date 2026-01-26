import * as SecureStore from "expo-secure-store"

const key = "api_key"
export const getApiKey = () => SecureStore.getItem(key)
export const deleteApiKey = () => SecureStore.deleteItemAsync(key)
export const setApiKey = (v: string) => SecureStore.setItem(key, v)

