export type RuleLogic = "and" | "or";
export type RuleField =
  | "merchant"
  | "description"
  | "amount"
  | "account_id"
  | "transaction_category_id"
  | "transaction_type";

export type RuleOperator =
  | "contains"
  | "equals"
  | "starts_with"
  | "ends_with"
  | "eq"
  | "gt"
  | "gte"
  | "lt"
  | "lte";

export type RuleConditionLeaf = {
  client_id?: string;
  field: RuleField;
  operator: RuleOperator;
  value: string | number | null;
};

export type RuleConditionGroup = {
  client_id?: string;
  logic: RuleLogic;
  children: RuleCondition[];
};

export type RuleCondition = RuleConditionLeaf | RuleConditionGroup;

export type AssignCategoryAction = {
  client_id?: string;
  type: "assign_category";
  transaction_category_id: number | null;
};

export type AddTagsAction = {
  client_id?: string;
  type: "add_tags";
  tag_ids: number[];
};

export type LinkRecurringTransactionAction = {
  client_id?: string;
  type: "link_recurring_transaction";
  recurring_transaction_id: number | null;
};

export type RuleAction =
  | AssignCategoryAction
  | AddTagsAction
  | LinkRecurringTransactionAction;

export type Rule = {
  id: number;
  name: string;
  description?: string;
  enabled: boolean;
  priority: number;
  conditions: RuleConditionGroup;
  actions: RuleAction[];
  overwrite_mode: "fill_blanks";
  last_run_at?: string;
  last_run_status?: string;
  last_run_matched_count: number;
  last_run_updated_count: number;
  last_error?: string;
  created_at: string;
  updated_at: string;
};

export type RulePayload = {
  name: string;
  description?: string;
  enabled: boolean;
  priority?: number;
  conditions: RuleConditionGroup;
  actions: RuleAction[];
  overwrite_mode?: "fill_blanks";
};
