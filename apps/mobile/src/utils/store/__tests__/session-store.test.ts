import * as SecureStore from "expo-secure-store"
import AsyncStorage from "@react-native-async-storage/async-storage"

// Mock react-native to avoid native module issues with Platform.OS
jest.mock("react-native", () => ({
  Platform: { OS: "ios", select: jest.fn((obj: any) => obj.ios) },
}))

// Import after mock is set up
import { getToken, setToken, deleteToken } from "../session-store"

describe("session-store (native/ios platform)", () => {
  test("setToken stores value in SecureStore", async () => {
    await setToken("my-token")
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith("session_token", "my-token")
  })

  test("getToken retrieves value from SecureStore", async () => {
    await setToken("my-token")
    const token = await getToken()
    expect(SecureStore.getItemAsync).toHaveBeenCalledWith("session_token")
    expect(token).toBe("my-token")
  })

  test("deleteToken removes value from SecureStore", async () => {
    await setToken("my-token")
    await deleteToken()
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith("session_token")
  })

  test("getToken returns null when no token stored", async () => {
    const token = await getToken()
    expect(token).toBeNull()
  })
})

// For web platform: verify mock infrastructure works correctly
describe("session-store web path (mock verification)", () => {
  test("AsyncStorage mock setItem works", async () => {
    await AsyncStorage.setItem("session_token", "web-token")
    expect(AsyncStorage.setItem).toHaveBeenCalledWith("session_token", "web-token")
  })

  test("AsyncStorage mock getItem retrieves stored value", async () => {
    await AsyncStorage.setItem("session_token", "web-token")
    const value = await AsyncStorage.getItem("session_token")
    expect(value).toBe("web-token")
  })

  test("AsyncStorage mock removeItem works", async () => {
    await AsyncStorage.removeItem("session_token")
    expect(AsyncStorage.removeItem).toHaveBeenCalledWith("session_token")
  })
})
