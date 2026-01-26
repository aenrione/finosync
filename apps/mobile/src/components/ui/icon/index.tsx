import { icons } from "lucide-react-native"
import { cssInterop } from "nativewind"

import { cn } from "@/utils/tailwind"

type IconProps = {
  name: keyof typeof icons;
  className?: string;
  size?: number;
};

export const Icon = ({ name, className, size = 32 }: IconProps) => {
  const LucideIcon = icons[name]
  if (!LucideIcon) {
    console.warn(`Icon with name "${name}" does not exist in lucide-react-native.`)
    return null
  }

  cssInterop(LucideIcon, {
    className: {
      target: "style",
      nativeStyleToProp: {
        color: true,
        height: true,
        width: true,
      },
    },
  })

  return <LucideIcon className={cn("", className)} size={size} />
}

export default Icon
