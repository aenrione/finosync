import {
  Plus,
  Search,
  Grid3x3 as Grid3X3,
  List,
  RefreshCw,
  CircleAlert as AlertCircle,
  Folder,
  TrendingUp,
  X
} from "lucide-react-native"
import {
  View,
  Text,
  TouchableOpacity,
  RefreshControl,
  FlatList,
  Dimensions,
  TextInput,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import React, { useState, useCallback } from "react"
import { useRouter } from "expo-router"

import { useCategories } from "@/context/categories.context"
import { Category } from "@/types/category"
import Icon from "@/components/ui/icon"
import { useStore } from "@/utils/store"

const { width } = Dimensions.get("window")

interface CategoryCardProps {
  category: Category;
  onPress?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewMode?: "list" | "grid";
}



export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress, onEdit, onDelete, viewMode = "list" }) => {
  if (viewMode === "grid") {
    return (
      <View className="bg-card rounded-xl shadow-sm p-4 m-1" style={{ width: (width - 60) / 2 }}>
        <TouchableOpacity 
          className="flex-1" 
          onPress={onPress} 
          activeOpacity={0.7}
        >
          <View className="items-center">
            <View className="w-16 h-16 rounded-full bg-muted justify-center items-center mb-3">
              <Icon name={category.icon || "Folder"} size={32} className="text-muted-foreground" />
            </View>
            <Text className="text-base font-semibold text-foreground text-center mb-1" numberOfLines={1}>
              {category.name}
            </Text>
            {category.description && (
              <Text className="text-sm text-muted-foreground text-center mb-2" numberOfLines={2}>
                {category.description}
              </Text>
            )}
            <View className="items-center">
              <Text className="text-xs text-muted-foreground mb-1">
                {category.transaction_count || 0} transactions
              </Text>
              {category.total_amount && category.total_amount > 0 && (
                <Text className="text-xs font-semibold text-primary">
                    ${category.total_amount.toLocaleString()}
                </Text>
              )}
            </View>
          </View>
        </TouchableOpacity>
          
        <View className="flex-row justify-center mt-3 gap-2">
          <TouchableOpacity
            className="w-8 h-8 rounded-full justify-center items-center"
            onPress={onEdit}
            activeOpacity={0.7}
          >
            <Icon name="Pencil" size={14} className="text-muted-foreground" />
          </TouchableOpacity>
          <TouchableOpacity
            className="w-8 h-8 rounded-full justify-center items-center"
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Icon name="Trash2" size={14} className="text-destructive" />
          </TouchableOpacity>
        </View>
      </View>
    )
  }
  
  return (
    <View className="bg-card rounded-xl mb-3 shadow-sm flex-row items-center">
      <TouchableOpacity 
        className="flex-1 p-4" 
        onPress={onPress} 
        activeOpacity={0.7}
      >
        <View className="flex-row items-center flex-1">
          <View className="w-12 h-12 rounded-full bg-muted justify-center items-center mr-3">
            <Icon name={category.icon || "Folder"} size={24} className="text-muted-foreground" />
          </View>
          <View className="flex-1">
            <View className="flex-row items-center mb-1">
              <Text className="text-base font-semibold text-foreground flex-1">
                {category.name}
              </Text>
              {category.is_active === false && (
                <View className="bg-destructive/10 rounded-full px-2 py-1">
                  <Text className="text-xs font-semibold text-destructive">Inactive</Text>
                </View>
              )}
            </View>
            {category.description && (
              <Text className="text-sm text-muted-foreground mb-2" numberOfLines={1}>
                {category.description}
              </Text>
            )}
            <View className="flex-row items-center">
              <Text className="text-xs text-muted-foreground">
                {category.transaction_count || 0} transactions
              </Text>
              {category.total_amount && category.total_amount > 0 && (
                <>
                  <View className="w-1 h-1 rounded-full bg-muted-foreground mx-2" />
                  <Text className="text-xs font-semibold text-primary">
                      ${category.total_amount.toLocaleString()}
                  </Text>
                </>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
        
      <View className="flex-row pr-4 gap-2">
        <TouchableOpacity
          className="w-9 h-9 rounded-full justify-center items-center"
          onPress={onEdit}
          activeOpacity={0.7}
        >
          <Icon name="Pencil" size={16} className="text-muted-foreground" />
        </TouchableOpacity>
        <TouchableOpacity
          className="w-9 h-9 rounded-full justify-center items-center"
          onPress={onDelete}
          activeOpacity={0.7}
        >
          <Icon name="Trash2" size={16} className="text-destructive" />
        </TouchableOpacity>
      </View>
    </View>
  )
}
  