import { TouchableOpacityProps, Text, TouchableOpacity } from "react-native";
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

  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;

  buttonProps?: TouchableOpacityProps;
  containerClassName?: string;
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
  iconLeft,
  iconRight,
  buttonProps,
  containerClassName,
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
        containerClassName,
      )}
    >
      {iconLeft && iconLeft}
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
      {iconRight && iconRight}
    </TouchableOpacity>
  );
};

const styles = {
  base: "items-center justify-center rounded-medium gap-2",
  directions: {
    horizontal: "flex-row",
    vertical: "flex-col",
  },
  sizes: {
    sm: "h-[40px] px-2",
    md: "h-[50px] px-2",
    lg: "h-[80px] px-2",
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
