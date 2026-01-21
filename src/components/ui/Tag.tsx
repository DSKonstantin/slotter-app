import { View, Text } from "react-native";
import { ReactNode } from "react";

type TagVariant =
  | "info"
  | "accent"
  | "success"
  | "warning"
  | "default"
  | "error";

type TagSize = "sm" | "md";

type TagProps = {
  title: string;
  variant?: TagVariant;
  size?: TagSize;
  icon?: ReactNode;
};

export function Tag({
  title,
  variant = "default",
  size = "md",
  icon,
}: TagProps) {
  return (
    <View
      className={`${styles.base} ${styles.sizes[size]} ${styles.variants[variant]}`}
    >
      <Text
        className={`${styles.text.base} ${styles.text.sizes[size]} ${styles.text.variants[variant]}`}
      >
        {title}
      </Text>
      {icon && (
        <View className={`${styles.icon.base} ${styles.icon.sizes[size]}`}>
          {icon}
        </View>
      )}
    </View>
  );
}

const styles = {
  base: "flex-row items-center justify-center rounded-lg self-start",

  sizes: {
    sm: "h-[26px] px-2",
    md: "h-9 px-3",
  },

  variants: {
    info: "bg-accent-blueLight",
    accent: "bg-accent",
    success: "bg-accent-slotterGreen",
    warning: "bg-accent-yellow",
    default: "bg-background",
    error: "bg-accent-redLight",
  },

  text: {
    base: "font-inter-medium",

    sizes: {
      sm: "text-caption",
      md: "text-body",
    },

    variants: {
      info: "text-accent",
      accent: "text-accent-azure",
      success: "text-accent-green",
      warning: "text-accent-darkYellow",
      default: "text-grey",
      error: "text-accent-red",
    },
  },

  icon: {
    base: "ml-1 items-center justify-center",

    sizes: {
      sm: "h-4 w-4",
      md: "h-5 w-5",
    },
  },
};
