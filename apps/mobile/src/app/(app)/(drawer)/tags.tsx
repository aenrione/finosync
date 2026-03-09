import {
  View,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState, useCallback, useEffect } from "react"
import { useRouter } from "expo-router"

import { Input } from "@/components/ui/input"
import { Text } from "@/components/ui/text"
import { useStore } from "@/utils/store"
import Icon from "@/components/ui/icon"
import { Tag } from "@/types/tag"
import { tagService } from "@/services/tag.service"
import { TagChip } from "@/components/features/tags/tag-chip"

const Tags = () => {
  const router = useRouter()
  const setCurrentTag = useStore((state) => state.setCurrentTag)
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchVisible, setSearchVisible] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      const data = await tagService.fetchTags()
      setTags(data)
    } catch (error) {
      console.error("Failed to fetch tags:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const onRefresh = useCallback(async () => {
    setRefreshing(true)
    try {
      const data = await tagService.fetchTags()
      setTags(data)
    } catch (error) {
      console.error("Failed to refresh tags:", error)
    } finally {
      setRefreshing(false)
    }
  }, [])

  const handleDelete = async (tag: Tag) => {
    Alert.alert("Delete Tag", `Delete "${tag.name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await tagService.deleteTag(tag.id)
            setTags((prev) => prev.filter((t) => t.id !== tag.id))
          } catch (error) {
            console.error("Failed to delete tag:", error)
          }
        },
      },
    ])
  }

  const handleEdit = (tag: Tag) => {
    setCurrentTag(tag)
  }

  const filteredTags = searchTerm
    ? tags.filter((t) => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : tags

  const renderTagItem = ({ item }: { item: Tag }) => (
    <View className="flex-row items-center justify-between rounded-xl bg-card p-4 border border-border">
      <View className="flex-row items-center flex-1">
        {item.color && (
          <View
            className="h-4 w-4 rounded-full mr-3"
            style={{ backgroundColor: item.color }}
          />
        )}
        <View className="flex-1">
          <Text className="text-base font-medium text-foreground">{item.name}</Text>
          {item.transaction_count !== undefined && (
            <Text className="text-xs text-muted-foreground">
              {item.transaction_count} transaction{item.transaction_count !== 1 ? "s" : ""}
            </Text>
          )}
        </View>
      </View>
      <View className="flex-row items-center gap-2">
        <TouchableOpacity
          onPress={() => handleEdit(item)}
          className="w-8 h-8 rounded-full bg-muted justify-center items-center"
        >
          <Icon name="Pencil" className="text-muted-foreground" size={16} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          className="w-8 h-8 rounded-full bg-muted justify-center items-center"
        >
          <Icon name="Trash2" className="text-destructive" size={16} />
        </TouchableOpacity>
      </View>
    </View>
  )

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="bg-card px-5 pb-4 border-b border-border">
        <View className="flex-row justify-between items-start pt-4">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-foreground mb-1">Tags</Text>
            <Text className="text-base text-muted-foreground">
              Organize transactions with tags
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-muted justify-center items-center"
              onPress={onRefresh}
            >
              <Icon name="RefreshCw" className="text-muted-foreground" size={20} />
            </TouchableOpacity>
            <TouchableOpacity
              className="w-10 h-10 rounded-full bg-muted justify-center items-center"
              onPress={() => setSearchVisible(!searchVisible)}
            >
              <Icon name="Search" className="text-muted-foreground" size={20} />
            </TouchableOpacity>
          </View>
        </View>
        {searchVisible && (
          <View className="mt-3">
            <View className="flex-row items-center bg-muted rounded-xl px-4 py-3">
              <Icon name="Search" className="text-muted-foreground mr-3" size={20} />
              <Input
                className="flex-1 border-0"
                placeholder="Search tags..."
                value={searchTerm}
                onChangeText={setSearchTerm}
                autoFocus
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm("")}>
                  <Icon name="X" className="text-muted-foreground" size={20} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      </View>

      <View className="flex-1">
        {loading && !refreshing ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center">
              <Icon name="RefreshCw" className="text-muted-foreground mb-3" size={32} />
              <Text className="text-base text-muted-foreground">Loading tags...</Text>
            </View>
          </View>
        ) : filteredTags.length === 0 ? (
          <View className="flex-1 justify-center items-center px-5">
            <View className="items-center max-w-xs">
              <Icon name="Tag" className="text-muted-foreground mb-4" size={64} />
              <Text className="text-xl font-semibold text-foreground mb-2">
                {searchTerm ? "No tags found" : "No tags yet"}
              </Text>
              <Text className="text-sm text-muted-foreground text-center leading-5 mb-6">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Create your first tag to start labeling transactions"}
              </Text>
              {!searchTerm && (
                <TouchableOpacity
                  className="flex-row items-center bg-primary rounded-xl px-5 py-3"
                  onPress={() => router.push("/(app)/add-tag")}
                >
                  <Icon name="Plus" className="text-primary-foreground mr-2" size={16} />
                  <Text className="text-sm font-semibold text-primary-foreground">Create Tag</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ) : (
          <FlatList
            data={filteredTags}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderTagItem}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerClassName="p-5 pb-24"
            ItemSeparatorComponent={() => <View className="h-3" />}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <TouchableOpacity
        className="absolute bottom-8 right-5 w-14 h-14 rounded-full bg-primary justify-center items-center shadow-lg"
        onPress={() => router.push("/(app)/add-tag")}
        activeOpacity={0.8}
      >
        <Icon name="Plus" className="text-primary-foreground" size={24} />
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default Tags
