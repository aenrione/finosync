import { View, ScrollView, TouchableOpacity, Alert } from "react-native"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"

import { useCategories } from "@/context/categories.context"
import { Button, ButtonText } from "@/components/ui/button"
import BackHeader from "@/components/back-header"
import IconPicker from "@/components/features/categories/icon-picker"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"

const AddCategory = () => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState<IconName>("Plus")
  const [isModalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const params = useLocalSearchParams()
  const { t } = useTranslation()
  const { createCategory, updateCategory } = useCategories()

  const isEditing = params.id !== undefined
  const categoryId = isEditing ? Number(params.id) : undefined

  const toggleModal = () => setModalVisible(!isModalVisible)

  useEffect(() => {
    if (isEditing && params) {
      setSelectedIcon((params.icon as IconName) || "Plus")
      setName((params.name as string) || "")
      setDescription((params.description as string) || "")
    }
  }, [isEditing, params])

  const isValid = () => name.trim().length > 0 && selectedIcon !== "Plus"

  const handleSave = async () => {
    if (!isValid()) return

    setLoading(true)
    try {
      const formData = {
        name: name.trim(),
        description: description.trim() || undefined,
        icon: selectedIcon,
      }

      if (isEditing && categoryId) {
        await updateCategory(categoryId, formData)
      } else {
        await createCategory(formData)
      }

      // Navigate back to categories page explicitly
      router.push("/(app)/(drawer)/categories")
    } catch (error) {
      Alert.alert(
        t("error"),
        error instanceof Error ? error.message : "Failed to save category"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    // Navigate back to categories page explicitly
    router.push("/(app)/(drawer)/categories")
  }

  return (
    <View className="flex-1 bg-background">
      <View className="p-5 flex-row items-center justify-between bg-card border-b border-border">
        <TouchableOpacity
          activeOpacity={0.8}
          className="p-1 items-start"
          onPress={handleBack}
        >
          <Icon name="ChevronLeft" className="text-foreground" size={20} />
        </TouchableOpacity>

        <Text className="text-foreground text-lg font-semibold">
          {isEditing ? t("new_category.edit") : t("new_category.new")}
        </Text>

        {/* Placeholder right icon for layout symmetry */}
        <Icon name="ChevronRight" className="text-transparent" size={25} />
      </View>

      <ScrollView className="flex-1 px-6 pt-4" showsVerticalScrollIndicator={false}>
        {/* Icon Picker Section */}
        <View className="mb-6">
          <Text className="text-muted-foreground font-semibold text-sm mb-3">
            {t("new_category.icon")}
            <Text className="text-destructive ml-1">*</Text>
          </Text>
          <TouchableOpacity
            onPress={toggleModal}
            className="bg-muted border border-border rounded-xl p-4 flex-row items-center justify-between min-h-[56px]"
          >
            <View className="flex-row items-center">
              <View className="w-10 h-10 rounded-full bg-primary/10 items-center justify-center mr-3">
                <Icon name={selectedIcon} />
              </View>
              <Text className="text-foreground text-base font-medium">
                {selectedIcon === "Plus" ? t("new_category.icon_placeholder") : selectedIcon}
              </Text>
            </View>
            <Icon name="ChevronRight" />
          </TouchableOpacity>

          <IconPicker
            isVisible={isModalVisible}
            onSelectIcon={setSelectedIcon}
            onClose={toggleModal}
          />
        </View>

        {/* Name Input Section */}
        <View className="mb-6">
          <Text className="text-muted-foreground font-semibold text-sm mb-3">
            {t("new_category.name")}
            <Text className="text-destructive ml-1">*</Text>
          </Text>
          <Input
            className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[56px]"
            placeholder={t("new_category.name_placeholder")}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description Input Section */}
        <View className="mb-6">
          <Text className="text-muted-foreground font-semibold text-sm mb-3">
            {t("new_category.desc")}
          </Text>
          <Input
            className="w-full rounded-xl px-4 py-4 text-base font-medium min-h-[80px]"
            placeholder={t("new_category.desc_placeholder")}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </ScrollView>

      {/* Save Button */}
      <View className="p-6 bg-background border-t border-border">
        <Button
          onPress={handleSave}
          disabled={!isValid() || loading}
          className="rounded-xl py-4"
        >
          <ButtonText>
            {loading ? (isEditing ? "Updating..." : "Creating...") : t("save")}
          </ButtonText>
        </Button>
      </View>
    </View>
  )
}

export default AddCategory
