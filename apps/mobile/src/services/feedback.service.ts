import { fetchWithAuth } from "@/utils/api"

type CreateFeedbackData = {
  content: string
  app_version?: string
  device_info?: string
}

export const feedbackService = {
  async create(data: CreateFeedbackData): Promise<void> {
    const res = await fetchWithAuth("/feedbacks", {
      method: "POST",
      body: JSON.stringify({ feedback: data }),
    })
    if (!res.ok) {
      const json = await res.json().catch(() => null)
      throw new Error(json?.error || "Failed to send feedback")
    }
  },
}
