import { ReactNode } from "react";
import { View, Text } from "react-native";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "accent"
  | "info"
  | "success"
  | "warning";
type BadgeSize = "sm" | "md";

type BadgeProps = {
  title: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
};

export function Badge({
  title,
  variant = "primary",
  size = "md",
  icon,
}: BadgeProps) {
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
  base: "flex-row items-center justify-center rounded-full self-start",

  sizes: {
    sm: "h-[26px] px-[10px]",
    md: "h-9 px-3",
  },

  variants: {
    primary: "bg-background-black",
    secondary: "bg-background",
    accent: "bg-primary-blue-500",
    info: "bg-primary-blue-100",
    success: "bg-primary-green-500",
    warning: "bg-accent-yellow-500",
  },

  text: {
    base: "font-inter-medium",

    sizes: {
      sm: "text-caption",
      md: "text-body",
    },

    variants: {
      primary: "text-neutral-200",
      secondary: "text-neutral-500",
      accent: "text-accent-azure-500",
      info: "text-primary-blue-500",
      success: "text-primary-green-700",
      warning: "text-accent-yellow-700",
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
