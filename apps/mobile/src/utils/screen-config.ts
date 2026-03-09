import { icons } from "lucide-react-native";
type ScreenConfig = {
  name: string;
  headerShown?: boolean;
  icon?: keyof typeof icons;
};

export const tabScreens: ScreenConfig[] = [
  {
    name: "dashboard",
    icon: "House",
  },
  {
    name: "accounts",
    icon: "Wallet",
  },
  {
    name: "transactions",
    icon: "ReceiptText",
  },
  {
    name: "cash-flow",
    icon: "ChartColumn",
  },
  {
    name: "budget",
    icon: "PiggyBank",
  },
];

export const drawerScreens: ScreenConfig[] = [
  {
    name: "(tabs)",
    headerShown: false,
    icon: "House",
  } as ScreenConfig,
  {
    name: "shopping",
    icon: "ShoppingCart",
  },
  {
    name: "tags",
    icon: "Tag",
  },
  {
    name: "rules",
    icon: "SlidersHorizontal",
  },
  {
    name: "recurring",
    icon: "Repeat",
  },
  {
    name: "crypto",
    icon: "Bitcoin",
  },
  {
    name: "categories",
    icon: "Tags",
  },
  {
    name: "settings",
    icon: "Settings",
  },
  {
    name: "about",
    icon: "Info",
  },
  {
    name: "feedback",
    icon: "MessageSquare",
  },
];
