import { random_rgba } from "../colors"

describe("random_rgba", () => {
  test("returns a valid rgba string", () => {
    const result = random_rgba()
    expect(result).toMatch(/^rgba\(\d{1,3},\d{1,3},\d{1,3},1\)$/)
  })

  test("returns rgb values in range 0-200", () => {
    // Run multiple times to increase confidence
    for (let i = 0; i < 50; i++) {
      const result = random_rgba()
      const match = result.match(/rgba\((\d+),(\d+),(\d+),1\)/)
      expect(match).not.toBeNull()

      const [, r, g, b] = match!
      expect(Number(r)).toBeGreaterThanOrEqual(0)
      expect(Number(r)).toBeLessThanOrEqual(200)
      expect(Number(g)).toBeGreaterThanOrEqual(0)
      expect(Number(g)).toBeLessThanOrEqual(200)
      expect(Number(b)).toBeGreaterThanOrEqual(0)
      expect(Number(b)).toBeLessThanOrEqual(200)
    }
  })

  test("returns alpha value of 1", () => {
    const result = random_rgba()
    expect(result).toContain(",1)")
  })
})
