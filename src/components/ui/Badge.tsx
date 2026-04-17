import { ReactNode } from "react";
import {
  TouchableOpacity,
  View,
  Text,
  ViewStyle,
  TextStyle,
} from "react-native";
import { twMerge } from "tailwind-merge";

type BadgeVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "accent"
  | "info"
  | "mint"
  | "success"
  | "warning"
  | "neutral"
  | "error";

type BadgeSize = "sm" | "md";

type BadgeProps = {
  title: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: ReactNode;
  className?: string;
  style?: ViewStyle;
  textStyle?: TextStyle;
  onPress?: () => void;
  disabled?: boolean;
  activeOpacity?: number;
};

export function Badge({
  title,
  variant = "primary",
  size = "md",
  icon,
  className,
  style,
  textStyle,
  onPress,
  disabled = false,
  activeOpacity = 0.7,
}: BadgeProps) {
  const containerClass = twMerge(
    "flex-row items-center justify-center rounded-full self-start",
    sizes.container[size],
    variants[variant].container,
    disabled && "opacity-40",
    className,
  );

  const textClass = twMerge(
    "font-inter-semibold tracking-wide",
    sizes.text[size],
    variants[variant].text,
  );

  const content = (
    <>
      <Text className={textClass} style={textStyle} numberOfLines={1}>
        {title}
      </Text>
      {icon && (
        <View
          className={twMerge(
            "items-center justify-center ml-1",
            sizes.icon[size],
          )}
        >
          {icon}
        </View>
      )}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled}
        activeOpacity={activeOpacity}
        className={containerClass}
        style={style}
      >
        {content}
      </TouchableOpacity>
    );
  }

  return (
    <View className={containerClass} style={style}>
      {content}
    </View>
  );
}

const sizes = {
  container: {
    sm: "h-[26px] px-2.5",
    md: "h-[36px] px-3",
  },
  text: {
    sm: "text-caption leading-[18px]",
    md: "text-body leading-[24px]",
  },
  icon: {
    sm: "h-[22px]",
    md: "h-[36px]",
  },
};

const variants: Record<BadgeVariant, { container: string; text: string }> = {
  primary: { container: "bg-neutral-900", text: "text-neutral-0" },
  secondary: { container: "bg-neutral-100", text: "text-neutral-700" },
  neutral: { container: "bg-neutral-400", text: "text-neutral-0" },
  tertiary: {
    container: "bg-background-surface border border-neutral-200",
    text: "text-neutral-800",
  },
  accent: { container: "bg-primary-blue-500", text: "text-neutral-0" },
  info: { container: "bg-primary-blue-100", text: "text-primary-blue-500" },
  mint: { container: "bg-primary-green-100", text: "text-primary-green-700" },
  success: {
    container: "bg-primary-green-500",
    text: "text-primary-green-800",
  },
  warning: {
    container: "bg-accent-yellow-500",
    text: "text-accent-yellow-700",
  },
  error: { container: "bg-accent-red-100", text: "text-accent-red-500" },
};
