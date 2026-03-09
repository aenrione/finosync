import { fetchWithAuth } from "@/utils/api"

export async function updatePreferences(params: {
  preferred_currency?: string
}) {
  const response = await fetchWithAuth("/user/preferences", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  })

  if (!response.ok) {
    throw new Error("Failed to update preferences")
  }

  return response.json()
}

export async function deleteAccount() {
  const response = await fetchWithAuth("/user", {
    method: "DELETE",
  })

  if (!response.ok) {
    throw new Error("Failed to delete account")
  }
}
