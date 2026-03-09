import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import React, { useState } from "react";

import { colors } from "@/lib/colors";
import { ShoppingItem, ShoppingItemFormData } from "@/types/shopping";
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
            className="w-10 h-10 rounded-full bg-muted items-center justify-center"
            onPress={onCancel}
          >
            <Icon name="X" className="text-muted-foreground" size={20} />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-foreground">
            {initialData ? "Edit Shopping Item" : "Add Shopping Item"}
          </Text>
          <TouchableOpacity
            className={`px-4 py-2 rounded-xl flex-row items-center ${isValid ? "bg-primary" : "bg-muted"}`}
            onPress={handleSave}
            disabled={!isValid}
          >
            <Icon
              name="Save"
              className={isValid ? "text-white" : "text-muted-foreground"}
              size={20}
            />
            <Text
              className={`ml-2 font-semibold ${isValid ? "text-white" : "text-muted-foreground"}`}
            >
              Save
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-5 space-y-5">
            {/* Title */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Title *
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground"
                placeholder="Item name"
                placeholderTextColor={colors.mutedForeground}
                value={title}
                onChangeText={setTitle}
              />
            </View>

            {/* Description */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Description
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground"
                placeholder="Brief description (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>

            {/* Price */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Price *
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground"
                placeholder="0.00"
                placeholderTextColor={colors.mutedForeground}
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
              />
            </View>

            {/* Purchase Date */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Purchase Date
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground"
                placeholder="YYYY-MM-DD (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={purchaseDate}
                onChangeText={setPurchaseDate}
              />
            </View>

            {/* Source URL */}
            <View>
              <Text className="text-sm font-medium text-foreground mb-2">
                Source URL
              </Text>
              <TextInput
                className="w-full px-4 py-3 border border-border rounded-xl bg-card text-foreground"
                placeholder="https://example.com (optional)"
                placeholderTextColor={colors.mutedForeground}
                value={sourceHref}
                onChangeText={setSourceHref}
                keyboardType="url"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            {/* Summary */}
            {isValid && (
              <View className="bg-card rounded-2xl p-4 border border-border">
                <Text className="text-sm font-medium text-foreground mb-3">
                  Summary
                </Text>
                <View className="space-y-2">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Item</Text>
                    <Text className="text-sm font-medium text-foreground">
                      {title}
                    </Text>
                  </View>
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-muted-foreground">Price</Text>
                    <Text className="text-sm font-medium text-foreground">
                      ${parseFloat(price).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}
