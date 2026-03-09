import { setToken } from "@/utils/store/session-store"
import { checkSession } from "@/services/auth.service"
import { fetchApi, fetchWithAuth, markLoginTimestamp } from "@/utils/api"

type RegisterParams = {
  name: string
  email: string
  password: string
  passwordConfirmation: string
}

export async function registerUser({ name, email, password, passwordConfirmation }: RegisterParams) {
  const response = await fetchApi("/user", {
    method: "POST",
    body: JSON.stringify({
      name,
      email_address: email,
      password,
      password_confirmation: passwordConfirmation,
    }),
  })

  if (!response.ok) {
    const data = await response.json()
    const message = data.errors?.join(", ") || data.error || "Registration failed"
    throw new Error(message)
  }

  const data = await response.json()
  markLoginTimestamp()
  await setToken(data.token)
  await checkSession()

  return { success: true }
}

type PreferencesParams = {
  preferred_currency?: string
  monthly_income?: number
  financial_goals?: string[]
  onboarding_completed?: boolean
}

export async function saveOnboardingPreferences(params: PreferencesParams) {
  const response = await fetchWithAuth("/user/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error("Failed to save preferences")
  }

  return response.json()
}
