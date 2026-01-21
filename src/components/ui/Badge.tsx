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
    sm: "h-[26px] px-2",
    md: "h-9 px-3",
  },

  variants: {
    primary: "bg-primary",
    secondary: "bg-background",
    accent: "bg-accent",
    info: "bg-accent-blueLight",
    success: "bg-accent-slotterGreen",
    warning: "bg-accent-yellow",
  },

  text: {
    base: "font-inter-medium",

    sizes: {
      sm: "text-caption",
      md: "text-body",
    },

    variants: {
      primary: "text-grey-light",
      secondary: "text-grey",
      accent: "text-accent-azure",
      info: "text-accent",
      success: "text-accent-green",
      warning: "text-accent-darkYellow",
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
