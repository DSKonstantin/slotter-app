import {
  TouchableOpacityProps,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { twMerge } from "tailwind-merge";

export interface CustomBtn {
  title: string;
  onPress: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "accent" | "clear";
  textVariant?: "default" | "accent";
  direction?: "horizontal" | "vertical";

  fullWidth?: boolean;
  disabled?: boolean | undefined;
  loading?: boolean;

  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;

  buttonProps?: TouchableOpacityProps;
  buttonClassName?: string;
  textClassName?: string;
}

export const Button: React.FC<CustomBtn> = ({
  title,
  onPress,
  size = "md",
  variant = "primary",
  textVariant = "default",
  direction = "horizontal",
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  buttonProps,
  buttonClassName,
  textClassName,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      {...buttonProps}
      className={twMerge(
        styles.base,
        styles.sizes[size],
        styles.directions[direction],
        styles.bgColors[variant],
        disabled && "opacity-40",
        buttonClassName,
      )}
    >
      {loading ? (
        <ActivityIndicator size="small" color={getLoaderColor(variant)} />
      ) : (
        <>
          {leftIcon && leftIcon}
          <Text
            className={twMerge(
              styles.textBase,
              styles.textVariants[variant],
              textVariant === "accent" && styles.textAccent,
              disabled && styles.textDisabled,
              textClassName,
            )}
          >
            {title}
          </Text>
          {rightIcon && rightIcon}
        </>
      )}
    </TouchableOpacity>
  );
};

const getLoaderColor = (variant: CustomBtn["variant"]) => {
  switch (variant) {
    case "secondary":
    case "clear":
      return "#000";
    default:
      return "#fff";
  }
};

const styles = {
  base: "items-center justify-center rounded-medium gap-2",
  directions: {
    horizontal: "flex-row",
    vertical: "flex-col",
  },
  sizes: {
    sm: "h-[40px] px-4",
    md: "h-[50px] px-4",
    lg: "h-[80px] px-4",
  },

  bgColors: {
    primary: "bg-background-black",
    secondary: "bg-background-surface",
    accent: "bg-primary-blue-500",
    clear: "transparent",
  },

  textBase: "font-inter-semibold text-[16px]",
  textVariants: {
    primary: "text-neutral-0",
    secondary: "text-neutral-900",
    accent: "text-neutral-0",
    clear: "text-neutral-900",
  },
  textAccent: "text-primary-blue-500",
  textDisabled: "text-neutral-0",
};
