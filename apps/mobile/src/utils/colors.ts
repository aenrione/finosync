export function random_rgba() {
  const o = Math.round,
    r = Math.random,
    s = 200
  return "rgba(" + o(r() * s) + "," + o(r() * s) + "," + o(r() * s) + "," + "1" + ")"
}

