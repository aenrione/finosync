import { AccountType } from "@/types/account"

export type AccountTypeConfig = {
  type: AccountType
  name: string
  editable: boolean
  requiresCredentials: boolean
  requiresEmail: boolean
  requiresLink: boolean
  requiresName: boolean
  usesWidget: boolean
  icon?: string
}

export const ACCOUNT_TYPES: AccountTypeConfig[] = [
  {
    type: "local",
    name: "Local account",
    editable: true,
    requiresCredentials: false,
    requiresEmail: false,
    requiresLink: false,
    requiresName: true,
    usesWidget: false,
  },
  {
    type: "fintoc",
    name: "Bank account",
    editable: false,
    requiresCredentials: false,
    requiresEmail: false,
    requiresLink: false,
    requiresName: true,
    usesWidget: true,
  },
  {
    type: "fintual",
    name: "Fintual account",
    editable: false,
    requiresCredentials: true,
    requiresEmail: true,
    requiresLink: false,
    requiresName: true,
    usesWidget: false,
  },
  {
    type: "buda",
    name: "Buda account",
    editable: false,
    requiresCredentials: true,
    requiresEmail: false,
    requiresLink: false,
    requiresName: true,
    usesWidget: false,
  },
]

export const getAccountTypeConfig = (type: AccountType): AccountTypeConfig =>
  ACCOUNT_TYPES.find((config) => config.type === type) || ACCOUNT_TYPES[0]

/**
 * Returns account types available at runtime.
 * Fintoc is excluded when EXPO_PUBLIC_FINTOC_PUBLIC_KEY is not configured,
 * since the widget cannot be initialised without it.
 */
export const getAvailableAccountTypes = (): AccountTypeConfig[] => {
  const hasFintocKey = Boolean(process.env.EXPO_PUBLIC_FINTOC_PUBLIC_KEY)
  return ACCOUNT_TYPES.filter((config) => config.type !== "fintoc" || hasFintocKey)
}
