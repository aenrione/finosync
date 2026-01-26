import js from "@eslint/js"
import eslintConfigPrettier from "eslint-config-prettier"
import turboPlugin from "eslint-plugin-turbo"
import tseslint from "typescript-eslint"
import onlyWarn from "eslint-plugin-only-warn"
import perfectionist from "eslint-plugin-perfectionist"

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
    },
  },
  {
    plugins: {
      onlyWarn,
    },
  },
  {
    ignores: ["dist/**"],
  },
  {
    plugins: {
      perfectionist
    },
    rules: {
      "perfectionist/sort-imports": ["error", { type: "line-length", order: "desc", }],
    }
  },
  {
    rules: {
      quotes: ["error", "double"],
      semi: ["error", "never"],
      indent: ["error", 2],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "arrow-body-style": ["error", "as-needed"],
    }
  },
]
