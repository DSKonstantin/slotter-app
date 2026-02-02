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
    info: "bg-primary-blue-100",
    accent: "bg-primary-blue-500",
    success: "bg-primary-green-500",
    warning: "bg-accent-yellow-500",
    default: "bg-background",
    error: "bg-accent-red-500",
  },

  text: {
    base: "font-inter-medium",

    sizes: {
      sm: "text-caption",
      md: "text-body",
    },

    variants: {
      info: "text-primary-blue-500",
      accent: "text-accent-azure-500",
      success: "text-primary-green-700",
      warning: "text-accent-yellow-700",
      default: "text-neutral-500",
      error: "text-accent-red-500",
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
