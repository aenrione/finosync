import { Rule, RulePayload } from "@/types/rule"
import { fetchWithAuth } from "@/utils/api"

export const ruleService = {
  async fetchRules(): Promise<Rule[]> {
    const res = await fetchWithAuth("/rules")
    if (!res.ok) throw new Error("Failed to fetch rules")
    return res.json()
  },

  async fetchRule(id: number): Promise<Rule> {
    const res = await fetchWithAuth(`/rules/${id}`)
    if (!res.ok) throw new Error("Failed to fetch rule")
    return res.json()
  },

  async createRule(data: RulePayload): Promise<Rule> {
    const res = await fetchWithAuth("/rules", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule: data }),
    })

    if (!res.ok) throw new Error("Failed to create rule")
    return res.json()
  },

  async updateRule(id: number, data: Partial<RulePayload>): Promise<Rule> {
    const res = await fetchWithAuth(`/rules/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rule: data }),
    })

    if (!res.ok) throw new Error("Failed to update rule")
    return res.json()
  },

  async deleteRule(id: number): Promise<void> {
    const res = await fetchWithAuth(`/rules/${id}`, { method: "DELETE" })
    if (!res.ok) throw new Error("Failed to delete rule")
  },

  async runRule(id: number): Promise<void> {
    const res = await fetchWithAuth(`/rules/${id}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Failed to run rule")
  },

  async runAllRules(): Promise<void> {
    const res = await fetchWithAuth("/rules/run_all", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })

    if (!res.ok) throw new Error("Failed to run all rules")
  },

  async reorderRules(orderedIds: number[]): Promise<Rule[]> {
    const res = await fetchWithAuth("/rules/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ordered_ids: orderedIds }),
    })

    if (!res.ok) throw new Error("Failed to reorder rules")
    return res.json()
  },
}
