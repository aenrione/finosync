import { config } from "@repo/eslint-config/react-internal"

/** @type {import('typescript-eslint').Config} */
export default [
  ...config,
  {
    ignores: [
      ".expo/**", 
      "expo-plugins/**",
      "*.js",
    ],
  },
]