import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import { Picker } from "@react-native-picker/picker";

import {
  createEmptyAction,
  createEmptyCondition,
  createEmptyGroup,
  fieldLabel,
  hydrateAction,
  hydrateCondition,
  isConditionGroup,
  sanitizeAction,
  sanitizeCondition,
  summarizeAction,
  summarizeCondition,
} from "@/utils/rules";
import {
  RuleAction,
  RuleCondition,
  RuleConditionGroup,
  RuleConditionLeaf,
  RuleField,
  RuleOperator,
} from "@/types/rule";
import { recurringTransactionService } from "@/services/recurring-transaction.service";
import { IconName } from "@/types/icon";
import { RecurringTransaction } from "@/types/recurring-transaction";
import { useCategories } from "@/context/categories.context";
import { Button, ButtonText } from "@/components/ui/button";
import { useDashboard } from "@/context/dashboard.context";
import { ruleService } from "@/services/rule.service";
import { tagService } from "@/services/tag.service";
import ScreenHeader from "@/components/screen-header";
import { FormField } from "@/components/ui/form-field";
import { FormToggle } from "@/components/ui/form-toggle";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { Category } from "@/types/category";
import { Account } from "@/types/account";
import Icon from "@/components/ui/icon";
import { Tag } from "@/types/tag";

const FIELD_OPTIONS: { value: RuleField; label: string }[] = [
  { value: "merchant", label: "Merchant / description" },
  { value: "amount", label: "Amount" },
  { value: "account_id", label: "Account" },
  { value: "transaction_category_id", label: "Category" },
  { value: "transaction_type", label: "Transaction type" },
];

const OPERATOR_OPTIONS: Record<
  RuleField,
  { value: RuleOperator; label: string }[]
> = {
  merchant: [
    { value: "contains", label: "contains" },
    { value: "equals", label: "is" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
  ],
  description: [
    { value: "contains", label: "contains" },
    { value: "equals", label: "is" },
    { value: "starts_with", label: "starts with" },
    { value: "ends_with", label: "ends with" },
  ],
  amount: [
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "eq", label: "=" },
  ],
  account_id: [{ value: "eq", label: "is" }],
  transaction_category_id: [{ value: "eq", label: "is" }],
  transaction_type: [{ value: "eq", label: "is" }],
};

const ACTION_OPTIONS = [
  { value: "assign_category", label: "Assign category" },
  { value: "add_tags", label: "Add tags" },
  { value: "link_recurring_transaction", label: "Link recurring" },
] as const;

const TRANSACTION_TYPE_OPTIONS = [
  { value: "deposit", label: "Deposit" },
  { value: "withdrawal", label: "Withdrawal" },
  { value: "transfer", label: "Transfer" },
  { value: "purchase", label: "Purchase" },
  { value: "sale", label: "Sale" },
  { value: "expense", label: "Expense" },
  { value: "income", label: "Income" },
];

const AddRuleScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { categoriesData: categories } = useCategories();
  const { accounts } = useDashboard();

  const [tags, setTags] = useState<Tag[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [enabled, setEnabled] = useState(true);
  const [conditions, setConditions] =
    useState<RuleConditionGroup>(createEmptyGroup());
  const [actions, setActions] = useState<RuleAction[]>([createEmptyAction()]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = !!params.id;

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        const [tagsData, recurringData, ruleData] = await Promise.all([
          tagService.fetchTags(),
          recurringTransactionService.fetchAll(),
          params.id
            ? ruleService.fetchRule(Number(params.id))
            : Promise.resolve(null),
        ]);

        setTags(tagsData);
        setRecurringTransactions(recurringData);

        if (ruleData) {
          setName(ruleData.name);
          setDescription(ruleData.description || "");
          setEnabled(ruleData.enabled);
          setConditions(
            hydrateCondition(ruleData.conditions) as RuleConditionGroup,
          );
          setActions(ruleData.actions.map((action) => hydrateAction(action)));
        }
      } catch (error) {
        console.error("Failed to load rule builder:", error);
        Alert.alert("Error", "Failed to load rule");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [params.id, router]);

  const canSave = useMemo(
    () =>
      name.trim().length > 0 &&
      hasValidConditionTree(conditions) &&
      actions.every(isActionValid),
    [name, conditions, actions],
  );

  const handleSave = async () => {
    if (!canSave) {
      Alert.alert(
        "Incomplete rule",
        "Add a name, complete every condition, and configure each action.",
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        enabled,
        overwrite_mode: "fill_blanks" as const,
        conditions: sanitizeCondition(conditions) as RuleConditionGroup,
        actions: actions.map((action) => sanitizeAction(action)),
      };

      if (isEditing && params.id) {
        await ruleService.updateRule(Number(params.id), payload);
      } else {
        await ruleService.createRule(payload);
      }

      router.back();
    } catch (error) {
      console.error("Failed to save rule:", error);
      Alert.alert("Error", "Failed to save rule");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-background">
        <ScreenHeader
          title={isEditing ? "Edit Rule" : "New Rule"}
          variant="back"
        />
        <View className="flex-1 items-center justify-center px-6">
          <Icon
            name="RefreshCw"
            className="mb-3 text-muted-foreground"
            size={32}
          />
          <Text className="text-base text-muted-foreground">
            Loading builder...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background">
      <ScreenHeader
        title={isEditing ? "Edit Rule" : "New Rule"}
        variant="back"
      />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-2 rounded-3xl border border-border bg-card p-4">
          <Text className="text-lg font-semibold text-foreground">
            If-this-then-that for your money
          </Text>
          <Text className="mt-2 text-sm leading-5 text-muted-foreground">
            First matching rule wins. Rules only fill blanks or append safely,
            so manual work stays in control.
          </Text>
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-4">
          <Text className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Basics
          </Text>

          <View className="mt-4">
            <FormField
              label="Rule name"
              value={name}
              onChangeText={setName}
              placeholder="Give this automation a short name"
              required
            />

            <FormField
              label="Description"
              value={description}
              onChangeText={setDescription}
              placeholder="Optional note so you remember what this rule does"
              multiline
            />

            <FormToggle
              value={enabled}
              onValueChange={setEnabled}
              title="Enabled"
              subtitle="Disabled rules stay saved but will not run automatically."
              containerClassName="mb-0"
            />
          </View>
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Conditions
          </Text>
          <Text className="mt-2 text-sm text-muted-foreground">
            Build the matching logic. You can mix groups with AND / OR.
          </Text>

          <View className="mt-4">
            <ConditionGroupEditor
              group={conditions}
              onChange={setConditions}
              categories={categories}
              accounts={accounts || []}
              isRoot
            />
          </View>
        </View>

        <View className="mt-6 rounded-3xl border border-border bg-card p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Actions
              </Text>
              <Text className="mt-2 text-sm text-muted-foreground">
                A matched rule can run multiple actions in one pass.
              </Text>
            </View>
            <TouchableOpacity
              className="rounded-full bg-primary/10 p-2"
              onPress={() =>
                setActions((prev) => [...prev, createEmptyAction()])
              }
            >
              <Icon name="Plus" className="text-primary" size={16} />
            </TouchableOpacity>
          </View>

          <View className="mt-4 gap-4">
            {actions.map((action, index) => (
              <ActionEditor
                key={action.client_id || `${action.type}-${index}`}
                action={action}
                index={index}
                categories={categories}
                tags={tags}
                recurringTransactions={recurringTransactions}
                onChange={(nextAction) =>
                  setActions((prev) =>
                    prev.map((item, itemIndex) =>
                      itemIndex === index ? nextAction : item,
                    ),
                  )
                }
                onRemove={() =>
                  setActions((prev) =>
                    prev.length === 1
                      ? prev
                      : prev.filter((_, itemIndex) => itemIndex !== index),
                  )
                }
              />
            ))}
          </View>
        </View>

        <View className="mt-6 mb-6 rounded-3xl border border-border bg-card p-4">
          <Text className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Preview
          </Text>
          <Text className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            If
          </Text>
          <Text className="mt-1 text-sm text-foreground">
            {summarizeCondition(conditions, {
              categories,
              accounts: accounts || [],
            })}
          </Text>

          <Text className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Then
          </Text>
          <Text className="mt-1 text-sm text-foreground">
            {actions
              .map((action) =>
                summarizeAction(action, {
                  categories,
                  tags,
                  recurringTransactions,
                }),
              )
              .join(" • ")}
          </Text>
        </View>
      </ScrollView>

      <View className="border-t border-border bg-background p-6">
        <Button
          onPress={handleSave}
          disabled={!canSave || saving}
          className="rounded-xl py-4"
        >
          <ButtonText>
            {saving ? "Saving..." : isEditing ? "Update Rule" : "Create Rule"}
          </ButtonText>
        </Button>
      </View>
    </View>
  );
};

function ConditionGroupEditor({
  group,
  onChange,
  categories,
  accounts,
  isRoot = false,
}: {
  group: RuleConditionGroup;
  onChange: (group: RuleConditionGroup) => void;
  categories: Category[];
  accounts: Account[];
  isRoot?: boolean;
}) {
  const updateChild = (index: number, child: RuleCondition) => {
    const children = group.children.map((item, itemIndex) =>
      itemIndex === index ? child : item,
    );
    onChange({ ...group, children });
  };

  const removeChild = (index: number) => {
    const children = group.children.filter(
      (_, itemIndex) => itemIndex !== index,
    );
    onChange({
      ...group,
      children: children.length > 0 ? children : [createEmptyCondition()],
    });
  };

  return (
    <View
      className={`rounded-2xl border border-border bg-background p-3 ${isRoot ? "" : "mt-3"}`}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {isRoot ? "Root group" : "Nested group"}
        </Text>
        <View className="flex-row gap-2">
          {(["and", "or"] as const).map((logic) => (
            <TouchableOpacity
              key={logic}
              className={`rounded-full px-3 py-1.5 ${group.logic === logic ? "bg-primary" : "bg-muted"}`}
              onPress={() => onChange({ ...group, logic })}
            >
              <Text
                className={`text-xs font-semibold uppercase ${group.logic === logic ? "text-primary-foreground" : "text-muted-foreground"}`}
              >
                {logic}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View className="mt-3 gap-3">
        {group.children.map((child, index) =>
          isConditionGroup(child) ? (
            <View key={child.client_id || `${index}-group`}>
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-xs text-muted-foreground">
                  Nested group
                </Text>
                <TouchableOpacity onPress={() => removeChild(index)}>
                  <Text className="text-xs font-semibold text-destructive">
                    Remove group
                  </Text>
                </TouchableOpacity>
              </View>
              <ConditionGroupEditor
                group={child}
                onChange={(nextGroup) => updateChild(index, nextGroup)}
                categories={categories}
                accounts={accounts}
              />
            </View>
          ) : (
            <ConditionRow
              key={child.client_id || `${index}-condition`}
              condition={child}
              categories={categories}
              accounts={accounts}
              onChange={(nextCondition) => updateChild(index, nextCondition)}
              onRemove={() => removeChild(index)}
            />
          ),
        )}
      </View>

      <View className="mt-4 flex-row gap-2">
        <SmallButton
          label="Add condition"
          icon="Plus"
          onPress={() =>
            onChange({
              ...group,
              children: [...group.children, createEmptyCondition()],
            })
          }
        />
        <SmallButton
          label="Add group"
          icon="GitBranchPlus"
          onPress={() =>
            onChange({
              ...group,
              children: [...group.children, createEmptyGroup()],
            })
          }
        />
      </View>
    </View>
  );
}

function ConditionRow({
  condition,
  categories,
  accounts,
  onChange,
  onRemove,
}: {
  condition: RuleConditionLeaf;
  categories: Category[];
  accounts: Account[];
  onChange: (condition: RuleConditionLeaf) => void;
  onRemove: () => void;
}) {
  const operators =
    OPERATOR_OPTIONS[condition.field] || OPERATOR_OPTIONS.merchant;

  const handleFieldChange = (field: RuleField) => {
    const nextOperator = OPERATOR_OPTIONS[field][0]?.value || "contains";
    const nextValue =
      field === "amount"
        ? null
        : field === "account_id" || field === "transaction_category_id"
          ? null
          : "";
    onChange({ ...condition, field, operator: nextOperator, value: nextValue });
  };

  return (
    <View className="rounded-2xl border border-border bg-card p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground">
          {fieldLabel(condition.field)}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Icon name="Trash2" className="text-destructive" size={16} />
        </TouchableOpacity>
      </View>

      <LabeledPicker
        label="Field"
        selectedValue={condition.field}
        onValueChange={(value) => handleFieldChange(value as RuleField)}
        options={FIELD_OPTIONS}
      />

      <View className="mt-3">
        <LabeledPicker
          label="Operator"
          selectedValue={condition.operator}
          onValueChange={(value) =>
            onChange({ ...condition, operator: value as RuleOperator })
          }
          options={operators}
        />
      </View>

      <View className="mt-3">
        <Text className="mb-2 text-sm text-muted-foreground">Value</Text>
        {condition.field === "account_id" ? (
          <PickerBox>
            <Picker
              selectedValue={condition.value}
              onValueChange={(value) => onChange({ ...condition, value })}
            >
              <Picker.Item label="Select account" value={null} />
              {accounts.map((account) => (
                <Picker.Item
                  key={String(account.id)}
                  label={account.account_name}
                  value={account.id}
                />
              ))}
            </Picker>
          </PickerBox>
        ) : condition.field === "transaction_category_id" ? (
          <PickerBox>
            <Picker
              selectedValue={condition.value}
              onValueChange={(value) => onChange({ ...condition, value })}
            >
              <Picker.Item label="Select category" value={null} />
              {categories.map((category) => (
                <Picker.Item
                  key={category.id}
                  label={category.name}
                  value={category.id}
                />
              ))}
            </Picker>
          </PickerBox>
        ) : condition.field === "transaction_type" ? (
          <PickerBox>
            <Picker
              selectedValue={condition.value}
              onValueChange={(value) => onChange({ ...condition, value })}
            >
              <Picker.Item label="Select type" value="" />
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <Picker.Item
                  key={option.value}
                  label={option.label}
                  value={option.value}
                />
              ))}
            </Picker>
          </PickerBox>
        ) : (
          <Input
            value={condition.value === null ? "" : String(condition.value)}
            onChangeText={(value) =>
              onChange({
                ...condition,
                value:
                  condition.field === "amount"
                    ? value.trim().length === 0
                      ? null
                      : Number(value)
                    : value,
              })
            }
            placeholder={
              condition.field === "amount" ? "e.g. 1000" : "e.g. Amazon"
            }
            keyboardType={condition.field === "amount" ? "numeric" : "default"}
          />
        )}
      </View>
    </View>
  );
}

function ActionEditor({
  action,
  index,
  categories,
  tags,
  recurringTransactions,
  onChange,
  onRemove,
}: {
  action: RuleAction;
  index: number;
  categories: Category[];
  tags: Tag[];
  recurringTransactions: RecurringTransaction[];
  onChange: (action: RuleAction) => void;
  onRemove: () => void;
}) {
  const handleTypeChange = (type: RuleAction["type"]) => {
    if (type === "assign_category") {
      onChange({
        client_id: action.client_id,
        type,
        transaction_category_id: null,
      });
      return;
    }

    if (type === "add_tags") {
      onChange({ client_id: action.client_id, type, tag_ids: [] });
      return;
    }

    onChange({
      client_id: action.client_id,
      type,
      recurring_transaction_id: null,
    });
  };

  return (
    <View className="rounded-2xl border border-border bg-background p-3">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-medium text-foreground">
          Action {index + 1}
        </Text>
        <TouchableOpacity onPress={onRemove}>
          <Icon name="Trash2" className="text-destructive" size={16} />
        </TouchableOpacity>
      </View>

      <LabeledPicker
        label="Action"
        selectedValue={action.type}
        onValueChange={(value) => handleTypeChange(value as RuleAction["type"])}
        options={ACTION_OPTIONS.map((option) => ({
          value: option.value,
          label: option.label,
        }))}
      />

      {action.type === "assign_category" ? (
        <View className="mt-3">
          <LabeledPicker
            label="Category"
            selectedValue={action.transaction_category_id}
            onValueChange={(value) =>
              onChange({
                ...action,
                transaction_category_id: value as number | null,
              })
            }
            options={[
              { value: null, label: "Select category" },
              ...categories.map((category) => ({
                value: category.id,
                label: category.name,
              })),
            ]}
          />
        </View>
      ) : null}

      {action.type === "add_tags" ? (
        <View className="mt-3">
          <Text className="mb-2 text-sm text-muted-foreground">Tags</Text>
          <View className="flex-row flex-wrap gap-2">
            {tags.map((tag) => {
              const selected = action.tag_ids.includes(tag.id);
              return (
                <TouchableOpacity
                  key={tag.id}
                  className={`rounded-full border px-3 py-2 ${selected ? "border-primary bg-primary/10" : "border-border bg-card"}`}
                  onPress={() =>
                    onChange({
                      ...action,
                      tag_ids: selected
                        ? action.tag_ids.filter((tagId) => tagId !== tag.id)
                        : [...action.tag_ids, tag.id],
                    })
                  }
                >
                  <Text
                    className={`text-xs font-medium ${selected ? "text-primary" : "text-foreground"}`}
                  >
                    {tag.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      ) : null}

      {action.type === "link_recurring_transaction" ? (
        <View className="mt-3">
          <LabeledPicker
            label="Recurring transaction"
            selectedValue={action.recurring_transaction_id}
            onValueChange={(value) =>
              onChange({
                ...action,
                recurring_transaction_id: value as number | null,
              })
            }
            options={[
              { value: null, label: "Select recurring" },
              ...recurringTransactions.map((item) => ({
                value: item.id,
                label: item.name,
              })),
            ]}
          />
        </View>
      ) : null}
    </View>
  );
}

function LabeledPicker({
  label,
  selectedValue,
  onValueChange,
  options,
}: {
  label: string;
  selectedValue: string | number | null;
  onValueChange: (value: string | number | null) => void;
  options: { value: string | number | null; label: string }[];
}) {
  return (
    <>
      <Text className="mb-2 text-sm text-muted-foreground">{label}</Text>
      <PickerBox>
        <Picker selectedValue={selectedValue} onValueChange={onValueChange}>
          {options.map((option) => (
            <Picker.Item
              key={`${label}-${String(option.value)}`}
              label={option.label}
              value={option.value}
            />
          ))}
        </Picker>
      </PickerBox>
    </>
  );
}

function PickerBox({ children }: { children: React.ReactNode }) {
  return (
    <View className="overflow-hidden rounded-xl border border-border bg-muted">
      {children}
    </View>
  );
}

function SmallButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: IconName;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      className="flex-row items-center rounded-full bg-muted px-3 py-2"
      onPress={onPress}
    >
      <Icon name={icon} className="mr-2 text-muted-foreground" size={14} />
      <Text className="text-xs font-medium text-foreground">{label}</Text>
    </TouchableOpacity>
  );
}

function hasValidConditionTree(condition: RuleCondition): boolean {
  if (isConditionGroup(condition)) {
    return (
      condition.children.length > 0 &&
      condition.children.every((child) => hasValidConditionTree(child))
    );
  }

  if (condition.field === "amount") {
    return (
      typeof condition.value === "number" && !Number.isNaN(condition.value)
    );
  }

  return String(condition.value || "").trim().length > 0;
}

function isActionValid(action: RuleAction): boolean {
  switch (action.type) {
    case "assign_category":
      return !!action.transaction_category_id;
    case "add_tags":
      return action.tag_ids.length > 0;
    case "link_recurring_transaction":
      return !!action.recurring_transaction_id;
  }
}

export default AddRuleScreen;
