import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";
import { DollarSign, Calendar, Link2, Save } from "lucide-react-native";

import { colors } from "@/lib/colors";
import { ShoppingItem, ShoppingItemFormData } from "@/types/shopping";
import { FormField } from "@/components/ui/form-field";
import { MoneyInput } from "@/components/ui/money-input";
import { FormSection } from "@/components/ui/form-section";
import { showAmount } from "@/utils/currency";
import Icon from "@/components/ui/icon";

interface ShoppingItemFormProps {
  onSave: (item: ShoppingItemFormData) => void;
  onCancel: () => void;
  initialData?: ShoppingItem;
}

export function ShoppingItemForm({
  onSave,
  onCancel,
  initialData,
}: ShoppingItemFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [price, setPrice] = useState(initialData?.price?.toString() || "");
  const [purchaseDate, setPurchaseDate] = useState(
    initialData?.purchase_date || "",
  );
  const [sourceHref, setSourceHref] = useState(initialData?.source_href || "");

  const handleSave = () => {
    if (!title.trim() || !price.trim()) {
      return;
    }

    const priceValue = parseFloat(price);
    if (isNaN(priceValue) || priceValue <= 0) {
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      price: priceValue,
      purchase_date: purchaseDate.trim() || undefined,
      source_href: sourceHref.trim() || undefined,
    });
  };

  const isValid =
    title.trim() !== "" &&
    price.trim() !== "" &&
    !isNaN(parseFloat(price)) &&
    parseFloat(price) > 0;

  return (
    <Modal
      visible={true}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onCancel}
    >
      <SafeAreaView className="flex-1 bg-background">
        {/* Header */}
        <View className="flex-row items-center justify-between px-5 pt-2 pb-4 bg-card border-b border-border">
          <TouchableOpacity
            className="w-10 h-10 rounded-lg bg-surface items-center justify-center"
            onPress={onCancel}
          >
            <Icon name="X" className="text-muted-foreground" size={20} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {initialData ? "Edit Item" : "Add Item"}
          </Text>
          <TouchableOpacity
            className={`px-4 py-2.5 rounded-lg flex-row items-center ${isValid ? "bg-primary" : "bg-muted"}`}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Save
              size={16}
              color={isValid ? "#FFFFFF" : colors.mutedForeground}
            />
            <Text
              className={`ml-1.5 text-sm font-semibold ${isValid ? "text-white" : "text-muted-foreground"}`}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <KeyboardAvoidingView
          className="flex-1"
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <ScrollView
            className="flex-1 px-5"
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View className="pt-4" />

            <FormSection title="Item Details">
              <FormField
                label="Title"
                placeholder="Item name"
                value={title}
                onChangeText={setTitle}
                required
              />

              <FormField
                label="Description"
                placeholder="Brief description (optional)"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
              />

              <MoneyInput
                label="Price"
                placeholder="0.00"
                value={price}
                onChangeValue={setPrice}
                icon={DollarSign}
                required
                containerClassName="mb-0"
              />
            </FormSection>

            <FormSection title="Additional Info">
              <FormField
                label="Purchase Date"
                placeholder="YYYY-MM-DD (optional)"
                value={purchaseDate}
                onChangeText={setPurchaseDate}
                icon={Calendar}
              />

              <FormField
                label="Source URL"
                placeholder="https://example.com (optional)"
                value={sourceHref}
                onChangeText={setSourceHref}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
                icon={Link2}
                containerClassName="mb-0"
              />
            </FormSection>

            {/* Summary */}
            {isValid && (
              <View className="rounded-xl border border-primary/20 bg-primary-light p-4 mb-4">
                <Text className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                  Summary
                </Text>
                <View className="gap-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Item</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {title}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Price</Text>
                    <Text className="text-sm font-semibold text-primary">
                      {showAmount(price)}
                    </Text>
                  </View>
                </View>
              </View>
            )}

            <View className="h-6" />
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}
