import "@testing-library/jest-native/extend-expect";

// Mock expo-secure-store with inline storage
const mockSecureStoreData = new Map<string, string>();

jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(
    async (key: string) => mockSecureStoreData.get(key) ?? null,
  ),
  setItemAsync: jest.fn(async (key: string, value: string) => {
    mockSecureStoreData.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key: string) => {
    mockSecureStoreData.delete(key);
  }),
  getItem: jest.fn((key: string) => mockSecureStoreData.get(key) ?? null),
  setItem: jest.fn((key: string, value: string) => {
    mockSecureStoreData.set(key, value);
  }),
}));

// Mock @react-native-async-storage/async-storage
const mockAsyncStorageData = new Map<string, string>();

jest.mock("@react-native-async-storage/async-storage", () => ({
  getItem: jest.fn(
    async (key: string) => mockAsyncStorageData.get(key) ?? null,
  ),
  setItem: jest.fn(async (key: string, value: string) => {
    mockAsyncStorageData.set(key, value);
  }),
  removeItem: jest.fn(async (key: string) => {
    mockAsyncStorageData.delete(key);
  }),
  clear: jest.fn(async () => {
    mockAsyncStorageData.clear();
  }),
}));

// Mock expo-router
jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
  })),
  router: {
    push: jest.fn(),
    replace: jest.fn(),
    navigate: jest.fn(),
    back: jest.fn(),
  },
  useLocalSearchParams: jest.fn(() => ({})),
  useSegments: jest.fn(() => []),
  RelativePathString: "",
}));

// Mock expo-constants
jest.mock("expo-constants", () => ({
  expoConfig: { hostUri: "localhost:8081" },
}));

// Mock nativewind - it depends on react-native-css-interop which requires native bridge
jest.mock("nativewind", () => ({
  cssInterop: jest.fn((_component: any) => _component),
  remapProps: jest.fn(),
  styled: jest.fn((component: any) => component),
}));

// Mock react-native-css-interop
jest.mock("react-native-css-interop", () => ({
  cssInterop: jest.fn((_component: any) => _component),
  remapProps: jest.fn(),
}));

// Mock useColorScheme hook used in themed components
jest.mock("@/components/theme/use-color-scheme", () => ({
  useColorScheme: jest.fn(() => "light"),
}));

// Clear mocked stores between tests
beforeEach(() => {
  mockSecureStoreData.clear();
  mockAsyncStorageData.clear();
  jest.clearAllMocks();
});
