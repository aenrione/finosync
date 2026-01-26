import { View, Text, TouchableOpacity, Modal } from "react-native"
import React, { useState } from "react"

import Icon from "@/components/ui/icon"

interface PeriodOption {
  label: string
  value: string
}

interface PeriodDropdownProps {
  options: PeriodOption[]
  selectedValue: string
  onValueChange: (value: string) => void
}

export default function PeriodDropdown({ options, selectedValue, onValueChange }: PeriodDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  
  const selectedOption = options.find(opt => opt.value === selectedValue) || options[0]

  return (
    <View>
      <TouchableOpacity
        className="flex-row items-center bg-white border border-slate-200 rounded-lg px-3 py-2"
        onPress={() => setIsOpen(true)}
      >
        <Text className="text-base font-semibold text-slate-600 flex-1">{selectedOption.label}</Text>
        <Icon name="ChevronDown" size={16} className="text-slate-400" />
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <View className="bg-white rounded-xl p-4 w-64 max-h-80">
            <Text className="text-lg font-semibold text-slate-900 mb-3">Select Period</Text>
            <View className="space-y-1">
              {options.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  className={`p-3 rounded-lg ${
                    selectedValue === option.value ? "bg-primary" : "bg-white"
                  }`}
                  onPress={() => {
                    onValueChange(option.value)
                    setIsOpen(false)
                  }}
                >
                  <Text className={`text-base font-medium ${
                    selectedValue === option.value ? "text-white" : "text-slate-600"
                  }`}>
                    {option.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  )
} 