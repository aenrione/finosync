import React, { useState } from "react";
import {
  Modal,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { BudgetAllocation } from "@/types/budget-period";
import { showAmount } from "@/utils/currency";
import { useStore } from "@/utils/store";

type Props = {
  visible: boolean;
  allocation: BudgetAllocation | null;
  onClose: () => void;
  onSave: (amount: number) => void;
  saving?: boolean;
};

export default function EditAllocationModal({
  visible,
  allocation,
  onClose,
  onSave,
  saving = false,
}: Props) {
  const [amount, setAmount] = useState("");
  const isVisible = useStore((s) => s.isVisible);
  const isEditingExistingAllocation = allocation?.id !== null;

  React.useEffect(() => {
    if (allocation) {
      setAmount(
        allocation.planned_amount > 0
          ? allocation.planned_amount.toString()
          : "",
      );
    }
  }, [allocation]);

  if (!allocation) return null;

  const handleSave = () => {
    const parsed = parseFloat(amount) || 0;
    onSave(parsed);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-end"
      >
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-card rounded-t-3xl px-6 pt-6 pb-10 shadow-lg">
          {/* Header */}
          <View className="flex-row items-center justify-between mb-6">
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-muted justify-center items-center mr-3">
                <Icon
                  name={allocation.category_icon as any}
                  size={20}
                  className="text-muted-foreground"
                />
              </View>
              <View>
                <Text className="text-xs uppercase tracking-wide text-muted-foreground">
                  {isEditingExistingAllocation ? "Edit budget" : "Set budget"}
                </Text>
                <Text className="text-lg font-semibold text-foreground">
                  {allocation.category_name}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} hitSlop={12}>
              <Icon name="X" size={22} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>

          {/* Actual spend context */}
          <View className="bg-muted/50 rounded-xl p-4 mb-5">
            <Text className="text-xs text-muted-foreground mb-1">
              Spent this month
            </Text>
            <Text className="text-lg font-mono font-bold text-foreground">
              {showAmount(allocation.actual_spend, isVisible)}
            </Text>
          </View>

          {/* Budget input */}
          <Text className="text-sm text-muted-foreground mb-2">
            Budget Amount
          </Text>
          <Input
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0"
            className="text-lg font-mono mb-6"
            autoFocus
          />

          {/* Save button */}
          <TouchableOpacity
            className="bg-primary rounded-xl py-4 items-center"
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.8}
          >
            <Text className="text-primary-foreground font-semibold text-base">
              {saving ? "Saving..." : "Save Budget"}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
