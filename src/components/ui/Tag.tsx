import { View, Text, Pressable } from "react-native";
import { ReactNode } from "react";

type TagVariant =
  | "info"
  | "accent"
  | "success"
  | "warning"
  | "default"
  | "mint"
  | "error";

type TagSize = "sm" | "md";

type TagProps = {
  title: string;
  variant?: TagVariant;
  size?: TagSize;
  icon?: ReactNode;
  onPress?: () => void;
};

export function Tag({
  title,
  variant = "default",
  size = "md",
  icon,
  onPress,
}: TagProps) {
  const Container = onPress ? Pressable : View;
  return (
    <Container
      onPress={onPress as never}
      className={`${styles.base} ${styles.sizes[size]} ${styles.variants[variant]}`}
    >
      <Text
        className={`${styles.text.base} ${styles.text.sizes[size]} ${styles.text.variants[variant]}`}
        numberOfLines={1}
        ellipsizeMode="tail"
      >
        {title}
      </Text>
      {icon && (
        <View className={`${styles.icon.base} ${styles.icon.sizes[size]}`}>
          {icon}
        </View>
      )}
    </Container>
  );
}

const styles = {
  base: "flex-row items-center justify-center rounded-lg self-start active:opacity-70",

  sizes: {
    sm: "h-[26px] px-2",
    md: "h-[36px] px-2",
  },

  variants: {
    info: "bg-primary-blue-100",
    accent: "bg-primary-blue-500",
    success: "bg-primary-green-500",
    mint: "bg-primary-green-100",
    warning: "bg-accent-yellow-500",
    default: "bg-background",
    error: "bg-accent-red-100",
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
      mint: "text-primary-green-700",
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
