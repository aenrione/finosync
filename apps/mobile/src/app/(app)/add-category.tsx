import { View, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import React, { useEffect, useState } from "react"
import { useTranslation } from "@/locale/app/add-category.text"
import { ChevronRight } from "lucide-react-native"

import { useCategories } from "@/context/categories.context"
import { Button, ButtonText } from "@/components/ui/button"
import { FormField } from "@/components/ui/form-field"
import { FormSection } from "@/components/ui/form-section"
import ScreenHeader from "@/components/screen-header"
import IconPicker from "@/components/features/categories/icon-picker"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { IconName } from "@/types/icon"
import { colors } from "@/lib/colors"

const AddCategory = () => {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [selectedIcon, setSelectedIcon] = useState<IconName>("Plus")
  const [isModalVisible, setModalVisible] = useState(false)
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const params = useLocalSearchParams()
  const text = useTranslation()
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

      router.push("/(app)/(drawer)/categories")
    } catch (error) {
      Alert.alert(
        text.errorTitle,
        error instanceof Error ? error.message : "Failed to save category"
      )
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.push("/(app)/(drawer)/categories")
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScreenHeader title={isEditing ? text.titleEdit : text.titleNew} variant="back" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1 px-5"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="pt-2" />

          <FormSection title="Category Details">
            {/* Icon Picker */}
            <View className="mb-5">
              <View className="flex-row items-center mb-2">
                <Text className="text-sm font-medium text-muted-foreground">
                  {text.icon}
                </Text>
                <Text className="text-error ml-0.5 text-sm">*</Text>
              </View>
              <TouchableOpacity
                onPress={toggleModal}
                className="flex-row items-center rounded-lg bg-surface border-[1.5px] border-border p-3.5"
              >
                <View className="w-10 h-10 rounded-lg bg-primary/10 items-center justify-center mr-3">
                  <Icon name={selectedIcon} size={20} />
                </View>
                <Text className="flex-1 text-base text-foreground font-medium">
                  {selectedIcon === "Plus" ? text.iconPlaceholder : selectedIcon}
                </Text>
                <ChevronRight size={18} color={colors.mutedForeground} />
              </TouchableOpacity>

              <IconPicker
                isVisible={isModalVisible}
                onSelectIcon={setSelectedIcon}
                onClose={toggleModal}
              />
            </View>

            {/* Name */}
            <FormField
              label={text.name}
              placeholder={text.namePlaceholder}
              value={name}
              onChangeText={setName}
              required
            />

            {/* Description */}
            <FormField
              label={text.desc}
              placeholder={text.descPlaceholder}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              containerClassName="mb-0"
            />
          </FormSection>

          <View className="h-6" />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Save Button */}
      <View className="px-5 py-4 bg-background border-t border-border">
        <Button
          onPress={handleSave}
          disabled={!isValid() || loading}
          className="w-full"
          size="lg"
        >
          <ButtonText size="lg">
            {loading ? (isEditing ? text.updating : text.creating) : text.save}
          </ButtonText>
        </Button>
      </View>
    </SafeAreaView>
  )
}

export default AddCategory
