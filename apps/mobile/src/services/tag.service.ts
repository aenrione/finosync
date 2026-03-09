import { fetchWithAuth } from "@/utils/api"
import { Tag } from "@/types/tag"

export const tagService = {
  async fetchTags(search?: string): Promise<Tag[]> {
    const params = search ? `?search=${encodeURIComponent(search)}` : ""
    const res = await fetchWithAuth(`/tags${params}`)
    if (!res.ok) throw new Error("Failed to fetch tags")
    return res.json()
  },

  async createTag(data: { name: string; color?: string }): Promise<Tag> {
    const res = await fetchWithAuth("/tags", {
      method: "POST",
      body: JSON.stringify({ tag: data }),
    })
    if (!res.ok) throw new Error("Failed to create tag")
    return res.json()
  },

  async updateTag(id: number, data: { name?: string; color?: string }): Promise<Tag> {
    const res = await fetchWithAuth(`/tags/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ tag: data }),
    })
    if (!res.ok) throw new Error("Failed to update tag")
    return res.json()
  },

  async deleteTag(id: number): Promise<void> {
    const res = await fetchWithAuth(`/tags/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete tag")
  },

  async setTransactionTags(transactionId: number, tagIds: number[]): Promise<void> {
    const res = await fetchWithAuth(`/transactions/${transactionId}/tags`, {
      method: "POST",
      body: JSON.stringify({ tag_ids: tagIds }),
    })
    if (!res.ok) throw new Error("Failed to set transaction tags")
  },
}
