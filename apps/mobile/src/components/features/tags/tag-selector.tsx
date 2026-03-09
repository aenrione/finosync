import React, { useCallback, useEffect, useState } from "react"
import { View, ActivityIndicator } from "react-native"

import { Text } from "@/components/ui/text"
import { Tag } from "@/types/tag"
import { tagService } from "@/services/tag.service"
import { TagChip } from "./tag-chip"

type TagSelectorProps = {
  selectedTagIds: number[]
  onSelectionChange: (tagIds: number[]) => void
}

export function TagSelector({ selectedTagIds, onSelectionChange }: TagSelectorProps) {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  const loadTags = useCallback(async () => {
    try {
      setLoading(true)
      const data = await tagService.fetchTags()
      setTags(data)
    } catch (error) {
      console.error("Failed to load tags:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTags()
  }, [loadTags])

  const toggleTag = (tagId: number) => {
    if (selectedTagIds.includes(tagId)) {
      onSelectionChange(selectedTagIds.filter((id) => id !== tagId))
    } else {
      onSelectionChange([...selectedTagIds, tagId])
    }
  }

  if (loading) {
    return <ActivityIndicator size="small" />
  }

  if (tags.length === 0) {
    return (
      <Text className="text-sm text-muted-foreground">
        No tags yet. Create tags from the Tags screen.
      </Text>
    )
  }

  return (
    <View className="flex-row flex-wrap gap-2">
      {tags.map((tag) => (
        <TagChip
          key={tag.id}
          name={tag.name}
          color={tag.color}
          selected={selectedTagIds.includes(tag.id)}
          onPress={() => toggleTag(tag.id)}
        />
      ))}
    </View>
  )
}
