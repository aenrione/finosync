import { useStore } from "../index"

describe("ConfigSlice", () => {
  test("initial url is localhost:2999", () => {
    expect(useStore.getState().url).toBe("http://localhost:2999")
  })

  test("setUrl updates the url", () => {
    useStore.getState().setUrl("https://api.example.com")

    expect(useStore.getState().url).toBe("https://api.example.com")
  })

  test("setUrl can set to empty string", () => {
    useStore.getState().setUrl("")

    expect(useStore.getState().url).toBe("")
  })

  afterEach(() => {
    // Reset to default
    useStore.getState().setUrl("http://localhost:2999")
  })
})
