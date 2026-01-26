import { View, TextInput, StyleSheet } from "react-native"
import React from "react"

type CustomInputProps = {
  value: string
  setValue: (value: string) => void
  placeholder: string
  secureTextEntry?: boolean
  pHColor?: string
  keyboardType?: "default" | "numeric" | "email-address" | "phone-pad"
  disabled?: boolean
  [key: string]: any // For additional props like aria-disabled
}

export default function CustomInput({
  value,
  setValue,
  placeholder,
  secureTextEntry,
  keyboardType = "default",
  pHColor = "#333",
  disabled = false,
  ...props
}: CustomInputProps) {
  return (
    <View style={styles.container}>
      <TextInput
        style={[styles.input, { color: "#333" }]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={pHColor}
        onChangeText={setValue}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        aria-disabled={disabled}
        editable={!disabled}
        {...props} // Spread any additional props
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    width: "100%",
    borderColor: "#e8e8e8",
    borderWidth: 1,
    borderRadius: 5,
    marginVertical: 5,
  },
  input: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
})
