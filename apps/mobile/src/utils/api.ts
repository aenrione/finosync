import { useStore } from "@/utils/store"

import { getToken } from "./store/session-store"

export async function fetchWithAuth(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const { url, logout } = useStore.getState()
  const token = await getToken()

  const fullUrl = typeof input === "string" ? `${url}${input}` : input

  const headers = {
    ...(init?.headers || {}),
    Authorization: `Bearer ${token}`,
  }

  const response = await fetch(fullUrl, {
    ...init,
    headers,
  })

  if (response.status === 401) { // Unauthorized
    console.warn("Unauthorized (401) - logging out user.")
    logout()
    throw new Error("Unauthorized")
  }

  return response
}

export async function fetchApi(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const { url } = useStore.getState()
  const fullUrl = typeof input === "string" ? `${url}${input}` : input

  return fetch(fullUrl, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      "Content-Type": "application/json",
    },
  })
}

