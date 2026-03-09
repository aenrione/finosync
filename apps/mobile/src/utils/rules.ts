import {
  RuleAction,
  RuleCondition,
  RuleConditionGroup,
  RuleConditionLeaf,
  RuleField,
} from "@/types/rule"
import { RecurringTransaction } from "@/types/recurring-transaction"
import { Category } from "@/types/category"
import { Account } from "@/types/account"
import { Tag } from "@/types/tag"

const nextId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

export function createEmptyCondition(): RuleConditionLeaf {
  return {
    client_id: nextId(),
    field: "merchant",
    operator: "contains",
    value: "",
  }
}

export function createEmptyGroup(): RuleConditionGroup {
  return {
    client_id: nextId(),
    logic: "and",
    children: [createEmptyCondition()],
  }
}

export function createEmptyAction(): RuleAction {
  return {
    client_id: nextId(),
    type: "assign_category",
    transaction_category_id: null,
  }
}

export function isConditionGroup(
  condition: RuleCondition,
): condition is RuleConditionGroup {
  return "children" in condition
}

export function fieldLabel(field: RuleField) {
  switch (field) {
  case "merchant":
    return "Merchant / description"
  case "description":
    return "Description"
  case "amount":
    return "Amount"
  case "account_id":
    return "Account"
  case "transaction_category_id":
    return "Category"
  case "transaction_type":
    return "Type"
  }
}

export function summarizeCondition(
  condition: RuleCondition,
  refs: {
    categories?: Category[];
    accounts?: Account[];
  } = {},
): string {
  if (isConditionGroup(condition)) {
    const children = condition.children.map((child) =>
      summarizeCondition(child, refs),
    )
    return children.length > 1
      ? `(${children.join(` ${condition.logic.toUpperCase()} `)})`
      : children[0] || "No conditions"
  }

  const value = summarizeConditionValue(condition, refs)
  const operator = summarizeOperator(condition.operator)
  return `${fieldLabel(condition.field)} ${operator} ${value}`
}

export function summarizeAction(
  action: RuleAction,
  refs: {
    categories?: Category[];
    tags?: Tag[];
    recurringTransactions?: RecurringTransaction[];
  } = {},
): string {
  switch (action.type) {
  case "assign_category": {
    const category = refs.categories?.find(
      (item) => item.id === action.transaction_category_id,
    )
    return `Assign category: ${category?.name || "Select category"}`
  }
  case "add_tags": {
    const names = refs.tags
      ?.filter((tag) => action.tag_ids.includes(tag.id))
      .map((tag) => tag.name)
    return `Add tags: ${names?.join(", ") || "Select tags"}`
  }
  case "link_recurring_transaction": {
    const recurring = refs.recurringTransactions?.find(
      (item) => item.id === action.recurring_transaction_id,
    )
    return `Link recurring: ${recurring?.name || "Select recurring"}`
  }
  }
}

export function sanitizeCondition(condition: RuleCondition): RuleCondition {
  if (isConditionGroup(condition)) {
    return {
      logic: condition.logic,
      children: condition.children.map((child) => sanitizeCondition(child)),
    }
  }

  return {
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
  }
}

export function sanitizeAction(action: RuleAction): RuleAction {
  switch (action.type) {
  case "assign_category":
    return {
      type: action.type,
      transaction_category_id: action.transaction_category_id,
    }
  case "add_tags":
    return {
      type: action.type,
      tag_ids: action.tag_ids,
    }
  case "link_recurring_transaction":
    return {
      type: action.type,
      recurring_transaction_id: action.recurring_transaction_id,
    }
  }
}

export function hydrateCondition(condition: RuleCondition): RuleCondition {
  if (isConditionGroup(condition)) {
    return {
      client_id: nextId(),
      logic: condition.logic,
      children: condition.children.map((child) => hydrateCondition(child)),
    }
  }

  return {
    client_id: nextId(),
    field: condition.field,
    operator: condition.operator,
    value: condition.value,
  }
}

export function hydrateAction(action: RuleAction): RuleAction {
  return {
    ...action,
    client_id: nextId(),
  }
}

function summarizeOperator(operator: string) {
  switch (operator) {
  case "contains":
    return "contains"
  case "equals":
  case "eq":
    return "is"
  case "starts_with":
    return "starts with"
  case "ends_with":
    return "ends with"
  case "gt":
    return ">"
  case "gte":
    return ">="
  case "lt":
    return "<"
  case "lte":
    return "<="
  default:
    return operator
  }
}

function summarizeConditionValue(
  condition: RuleConditionLeaf,
  refs: { categories?: Category[]; accounts?: Account[] },
) {
  if (condition.field === "account_id") {
    return (
      refs.accounts?.find((item) => String(item.id) === String(condition.value))
        ?.account_name || "account"
    )
  }

  if (condition.field === "transaction_category_id") {
    return (
      refs.categories?.find(
        (item) => String(item.id) === String(condition.value),
      )?.name || "category"
    )
  }

  if (condition.field === "transaction_type") {
    return String(condition.value || "type")
  }

  return String(condition.value || "value")
}
