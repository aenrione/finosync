import * as SecureStore from "expo-secure-store"

import { getApiKey, setApiKey, deleteApiKey } from "../api-key-store"

describe("api-key-store", () => {
  test("setApiKey stores value in SecureStore", () => {
    setApiKey("test-api-key")
    expect(SecureStore.setItem).toHaveBeenCalledWith("api_key", "test-api-key")
  })

  test("getApiKey retrieves value from SecureStore", () => {
    setApiKey("test-api-key")
    const key = getApiKey()
    expect(SecureStore.getItem).toHaveBeenCalledWith("api_key")
    expect(key).toBe("test-api-key")
  })

  test("deleteApiKey removes value from SecureStore", async () => {
    await deleteApiKey()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("api_key")
  })

  test("getApiKey returns null when no key stored", () => {
    const key = getApiKey()
    expect(key).toBeNull()
  })
})
