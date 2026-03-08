import { useStore } from "../index"
import { Category } from "@/types/category"

describe("CategorySlice", () => {
  const mockCategory: Category = {
    id: 1,
    name: "Food",
    description: "Food and dining",
  }

  beforeEach(() => {
    useStore.setState({
      currentCategory: undefined,
      router: null,
    })
  })

  test("initial currentCategory is undefined", () => {
    expect(useStore.getState().currentCategory).toBeUndefined()
  })

  test("setCurrentCategory updates currentCategory", () => {
    useStore.getState().setCurrentCategory(mockCategory)

    expect(useStore.getState().currentCategory).toEqual(mockCategory)
  })

  test("setCurrentCategory navigates to add-category when router is set", () => {
    const mockRouter = { push: jest.fn() }
    useStore.setState({ router: mockRouter as any })

    useStore.getState().setCurrentCategory(mockCategory)

    expect(mockRouter.push).toHaveBeenCalledWith("/add-category")
  })

  test("setCurrentCategory does not throw when router is null", () => {
    expect(() => useStore.getState().setCurrentCategory(mockCategory)).not.toThrow()
  })
})
