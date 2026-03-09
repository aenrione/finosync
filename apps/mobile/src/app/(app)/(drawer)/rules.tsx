import {
  Alert,
  FlatList,
  RefreshControl,
  Switch,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useCallback, useMemo, useState } from "react";
import { useFocusEffect, useRouter } from "expo-router";

import { recurringTransactionService } from "@/services/recurring-transaction.service";
import { summarizeAction, summarizeCondition } from "@/utils/rules";
import { useCategories } from "@/context/categories.context";
import { useDashboard } from "@/context/dashboard.context";
import ScreenHeader from "@/components/screen-header";
import { ruleService } from "@/services/rule.service";
import { tagService } from "@/services/tag.service";
import { IconName } from "@/types/icon";
import { RecurringTransaction } from "@/types/recurring-transaction";
import { Text } from "@/components/ui/text";
import Icon from "@/components/ui/icon";
import { Rule } from "@/types/rule";
import { Tag } from "@/types/tag";

const RulesScreen = () => {
  const router = useRouter();
  const { categoriesData: categories } = useCategories();
  const { accounts } = useDashboard();

  const [rules, setRules] = useState<Rule[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [recurringTransactions, setRecurringTransactions] = useState<
    RecurringTransaction[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [busyRuleId, setBusyRuleId] = useState<number | null>(null);
  const [runningAll, setRunningAll] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [rulesData, tagsData, recurringData] = await Promise.all([
        ruleService.fetchRules(),
        tagService.fetchTags(),
        recurringTransactionService.fetchAll(),
      ]);

      setRules(rulesData);
      setTags(tagsData);
      setRecurringTransactions(recurringData);
    } catch (error) {
      console.error("Failed to fetch rules:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData]),
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchData();
    } finally {
      setRefreshing(false);
    }
  }, [fetchData]);

  const handleToggleEnabled = async (rule: Rule, enabled: boolean) => {
    setBusyRuleId(rule.id);
    try {
      const updated = await ruleService.updateRule(rule.id, { enabled });
      setRules((prev) =>
        prev.map((item) => (item.id === rule.id ? updated : item)),
      );
    } catch (error) {
      console.error("Failed to update rule:", error);
      Alert.alert("Error", "Failed to update rule");
    } finally {
      setBusyRuleId(null);
    }
  };

  const handleDelete = (rule: Rule) => {
    Alert.alert("Delete Rule", `Delete "${rule.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          setBusyRuleId(rule.id);
          try {
            await ruleService.deleteRule(rule.id);
            setRules((prev) => prev.filter((item) => item.id !== rule.id));
          } catch (error) {
            console.error("Failed to delete rule:", error);
            Alert.alert("Error", "Failed to delete rule");
          } finally {
            setBusyRuleId(null);
          }
        },
      },
    ]);
  };

  const handleRunRule = async (rule: Rule) => {
    setBusyRuleId(rule.id);
    try {
      await ruleService.runRule(rule.id);
      Alert.alert(
        "Queued",
        `"${rule.name}" is now processing existing transactions.`,
      );
    } catch (error) {
      console.error("Failed to run rule:", error);
      Alert.alert("Error", "Failed to queue rule");
    } finally {
      setBusyRuleId(null);
    }
  };

  const handleRunAll = async () => {
    setRunningAll(true);
    try {
      await ruleService.runAllRules();
      Alert.alert(
        "Queued",
        "All enabled rules are now processing existing transactions.",
      );
    } catch (error) {
      console.error("Failed to run all rules:", error);
      Alert.alert("Error", "Failed to queue rules");
    } finally {
      setRunningAll(false);
    }
  };

  const handleMove = async (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= rules.length) return;

    const reordered = [...rules];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(nextIndex, 0, moved);
    setRules(reordered);

    try {
      const updated = await ruleService.reorderRules(
        reordered.map((rule) => rule.id),
      );
      setRules(updated);
    } catch (error) {
      console.error("Failed to reorder rules:", error);
      Alert.alert("Error", "Failed to reorder rules");
      fetchData();
    }
  };

  const stats = useMemo(() => {
    const enabledCount = rules.filter((rule) => rule.enabled).length;
    return {
      total: rules.length,
      enabled: enabledCount,
    };
  }, [rules]);

  const renderRule = ({ item, index }: { item: Rule; index: number }) => {
    const actionSummary = item.actions
      .map((action) =>
        summarizeAction(action, { categories, tags, recurringTransactions }),
      )
      .join(" • ");

    const isBusy = busyRuleId === item.id;

    return (
      <View className="rounded-2xl border border-border bg-card p-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1 pr-4">
            <Text className="text-lg font-semibold text-foreground">
              {item.name}
            </Text>
            {item.description ? (
              <Text className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </Text>
            ) : null}
          </View>

          <Switch
            value={item.enabled}
            disabled={isBusy}
            onValueChange={(value) => handleToggleEnabled(item, value)}
          />
        </View>

        <View className="mt-4 rounded-xl bg-muted/60 p-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            If
          </Text>
          <Text className="mt-1 text-sm text-foreground">
            {summarizeCondition(item.conditions, {
              categories,
              accounts: accounts || [],
            })}
          </Text>
        </View>

        <View className="mt-3 rounded-xl bg-primary/5 p-3">
          <Text className="text-xs font-semibold uppercase tracking-wide text-primary">
            Then
          </Text>
          <Text className="mt-1 text-sm text-foreground">{actionSummary}</Text>
        </View>

        <View className="mt-3 flex-row items-center justify-between">
          <Text className="text-xs text-muted-foreground">
            Priority #{index + 1}
          </Text>
          <Text className="text-xs text-muted-foreground">
            {item.last_run_status
              ? `${item.last_run_status} · ${item.last_run_updated_count} updates`
              : "Never run manually"}
          </Text>
        </View>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <ActionButton
            icon="Play"
            label={isBusy ? "Working..." : "Run now"}
            disabled={isBusy}
            onPress={() => handleRunRule(item)}
          />
          <ActionButton
            icon="Pencil"
            label="Edit"
            onPress={() =>
              router.push({
                pathname: "/(app)/add-rule",
                params: { id: item.id.toString() },
              })
            }
          />
          <ActionButton
            icon="ArrowUp"
            label="Up"
            disabled={index === 0}
            onPress={() => handleMove(index, -1)}
          />
          <ActionButton
            icon="ArrowDown"
            label="Down"
            disabled={index === rules.length - 1}
            onPress={() => handleMove(index, 1)}
          />
          <ActionButton
            icon="Trash2"
            label="Delete"
            tone="danger"
            onPress={() => handleDelete(item)}
          />
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader
        title="Rules"
        variant="drawer"
        rightActions={[
          { icon: "RefreshCw", onPress: onRefresh },
          { icon: "Plus", onPress: () => router.push("/(app)/add-rule") },
        ]}
      />

      <View className="px-5 pt-4">
        <View className="rounded-3xl border border-border bg-card p-4">
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-lg font-semibold text-foreground">
                Automation engine
              </Text>
              <Text className="mt-1 text-sm leading-5 text-muted-foreground">
                Auto-categorize, tag, and connect transactions to recurring
                templates.
              </Text>
            </View>
            <View className="rounded-2xl bg-primary/10 p-3">
              <Icon
                name="SlidersHorizontal"
                className="text-primary"
                size={20}
              />
            </View>
          </View>

          <View className="mt-4 flex-row gap-3">
            <View className="flex-1 rounded-2xl bg-muted p-3">
              <Text className="text-xs uppercase tracking-wide text-muted-foreground">
                Enabled
              </Text>
              <Text className="mt-1 text-2xl font-bold text-foreground">
                {stats.enabled}
              </Text>
            </View>
            <View className="flex-1 rounded-2xl bg-muted p-3">
              <Text className="text-xs uppercase tracking-wide text-muted-foreground">
                Total
              </Text>
              <Text className="mt-1 text-2xl font-bold text-foreground">
                {stats.total}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="mt-4 flex-row items-center justify-center rounded-2xl bg-primary px-4 py-3"
            disabled={runningAll}
            onPress={handleRunAll}
          >
            <Icon
              name="Play"
              className="mr-2 text-primary-foreground"
              size={16}
            />
            <Text className="text-sm font-semibold text-primary-foreground">
              {runningAll ? "Queueing rules..." : "Run All Rules"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-1">
        {loading && !refreshing ? (
          <View className="flex-1 items-center justify-center px-5">
            <Icon
              name="RefreshCw"
              className="mb-3 text-muted-foreground"
              size={32}
            />
            <Text className="text-base text-muted-foreground">
              Loading rules...
            </Text>
          </View>
        ) : rules.length === 0 ? (
          <View className="flex-1 items-center justify-center px-5">
            <View className="items-center">
              <Icon
                name="SlidersHorizontal"
                className="mb-4 text-muted-foreground"
                size={64}
              />
              <Text className="text-xl font-semibold text-foreground">
                No rules yet
              </Text>
              <Text className="mt-2 max-w-xs text-center text-sm leading-5 text-muted-foreground">
                Create your first rule to automate categorization, tagging, and
                recurring cleanup.
              </Text>
              <TouchableOpacity
                className="mt-6 flex-row items-center rounded-xl bg-primary px-5 py-3"
                onPress={() => router.push("/(app)/add-rule")}
              >
                <Icon
                  name="Plus"
                  className="mr-2 text-primary-foreground"
                  size={16}
                />
                <Text className="text-sm font-semibold text-primary-foreground">
                  Create Rule
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <FlatList
            data={rules}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderRule}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerClassName="p-5 pb-24"
            ItemSeparatorComponent={() => <View className="h-4" />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

function ActionButton({
  icon,
  label,
  onPress,
  disabled,
  tone = "default",
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
}) {
  const isDanger = tone === "danger";

  return (
    <TouchableOpacity
      className={`flex-row items-center rounded-full px-3 py-2 ${
        isDanger ? "bg-destructive/10" : "bg-muted"
      } ${disabled ? "opacity-50" : ""}`}
      disabled={disabled}
      onPress={onPress}
    >
      <Icon
        name={icon}
        className={`mr-2 ${isDanger ? "text-destructive" : "text-muted-foreground"}`}
        size={14}
      />
      <Text
        className={`text-xs font-medium ${isDanger ? "text-destructive" : "text-foreground"}`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default RulesScreen;
