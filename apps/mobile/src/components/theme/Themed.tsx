import { Text as DefaultText, View as DefaultView } from "react-native"
/**
 * Learn more about Light and Dark modes:
 * https://docs.expo.io/guides/color-schemes/
 */
import { cssInterop } from "nativewind"

import Colors from "@/constants/Colors"

import { useColorScheme } from "./useColorScheme"

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText["props"] & {text?: string}
export type ViewProps = ThemeProps & DefaultView["props"];

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme() ?? "light"
  const colorFromProps = props[theme]

  if (colorFromProps) {
    return colorFromProps
  } else {
    return Colors[theme][colorName]
  }
}

export function Text(props: TextProps) {
  const { style, lightColor, darkColor,text, ...otherProps} = props
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text")
  if (text) {
    return <DefaultText style={[{ color }, style]} {...otherProps}>{text}</DefaultText>
  }

  return <DefaultText style={[{ color }, style]} {...otherProps} />
}

cssInterop(Text, {
  className: {
    target: "style",
  },
})


export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, "background")

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />
}

cssInterop(View, {
  className: {
    target: "style",
  },
})

