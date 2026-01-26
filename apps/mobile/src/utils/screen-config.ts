import { icons } from "lucide-react-native"
type ScreenConfig = {
  name: string;
  headerShown?: boolean;
  icon?: keyof typeof icons;
}

export const tabScreens: ScreenConfig[] = [

  {
    name: "charts",
    icon: "ChartPie",
  },
  {
    name: "dashboard",
    icon: "House",
  },
  {
    name: "to-buy",
    icon: "ShoppingCart",
  },
]

export const drawerScreens: ScreenConfig[] = [
  {
    name: "(tabs)",
    headerShown: false,
    icon: "House",
  },
  {
    name: "categories",
    icon: "Copy",
  },
  {
    name: "crypto",
    icon: "Bitcoin",
  },
  {
    name: "about",
    icon: "Info",
  },
]
