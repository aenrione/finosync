import { useStore } from "../index";

const defaultUrl = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:3000";

describe("ConfigSlice", () => {
  test("initial url uses the configured API URL fallback", () => {
    expect(useStore.getState().url).toBe(defaultUrl);
  });

  test("setUrl updates the url", () => {
    useStore.getState().setUrl("https://api.example.com");

    expect(useStore.getState().url).toBe("https://api.example.com");
  });

  test("setUrl can set to empty string", () => {
    useStore.getState().setUrl("");

    expect(useStore.getState().url).toBe("");
  });

  test("language defaults to system", () => {
    expect(useStore.getState().language).toBe("system");
  });

  test("setLanguage updates the selected language", () => {
    useStore.getState().setLanguage("es");

    expect(useStore.getState().language).toBe("es");
  });

  afterEach(() => {
    // Reset to default
    useStore.getState().setUrl(defaultUrl);
    useStore.getState().setLanguage("system");
  });
});
