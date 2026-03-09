import { useRouter } from "expo-router"
import React, { useState } from "react"
import {
  Alert,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native"

import BackHeader from "@/components/back-header"
import { Button, ButtonText } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import Icon from "@/components/ui/icon"
import { useStore } from "@/utils/store"
import { tagService } from "@/services/tag.service"

const TAG_COLORS = [
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#78716C",
]

const AddTag = () => {
  const router = useRouter()
  const currentTag = useStore((state) => state.currentTag)
  const setCurrentTag = useStore((state) => state.setCurrentTag)

  const [name, setName] = useState(currentTag?.name || "")
  const [selectedColor, setSelectedColor] = useState(currentTag?.color || TAG_COLORS[0])
  const [loading, setLoading] = useState(false)

  const isEditing = !!currentTag

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("Error", "Please enter a tag name")
      return
    }

    setLoading(true)
    try {
      if (isEditing) {
        await tagService.updateTag(currentTag.id, {
          name: name.trim(),
          color: selectedColor,
        })
      } else {
        await tagService.createTag({
          name: name.trim(),
          color: selectedColor,
        })
      }
      setCurrentTag(undefined)
      router.back()
    } catch (error) {
      console.error("Failed to save tag:", error)
      Alert.alert("Error", "Failed to save tag")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setCurrentTag(undefined)
    router.back()
  }

  return (
    <View className="flex-1 bg-background">
      <BackHeader title={isEditing ? "Edit Tag" : "New Tag"} />

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Name Input */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-2">Tag Name</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g., Subscription, Travel..."
          />
        </View>

        {/* Color Picker */}
        <View className="mb-6">
          <Text className="text-sm text-muted-foreground mb-3">Color</Text>
          <View className="flex-row flex-wrap gap-3">
            {TAG_COLORS.map((color) => (
              <TouchableOpacity
                key={color}
                onPress={() => setSelectedColor(color)}
                className={`h-10 w-10 items-center justify-center rounded-full ${
                  selectedColor === color ? "border-2 border-foreground" : ""
                }`}
                style={{ backgroundColor: color }}
              >
                {selectedColor === color && (
                  <Icon name="Check" size={20} color="white" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preview */}
        <View className="mb-6 items-center rounded-xl bg-card p-6 border border-border">
          <View
            className="mb-3 h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: selectedColor + "20" }}
          >
            <Icon name="Tag" size={32} color={selectedColor} />
          </View>
          <Text className="text-lg font-semibold text-foreground">
            {name || "Tag Name"}
          </Text>
        </View>
      </ScrollView>

      {/* Footer Buttons */}
      <View className="p-6 border-t border-border bg-background">
        <View className="flex-row space-x-3">
          <Button variant="secondary" onPress={handleCancel} className="flex-1">
            <ButtonText variant="secondary">Cancel</ButtonText>
          </Button>
          <Button disabled={loading} onPress={handleSave} className="flex-1">
            <ButtonText>{loading ? "Saving..." : isEditing ? "Update" : "Create"}</ButtonText>
          </Button>
        </View>
      </View>
    </View>
  )
}

export default AddTag
