import { TouchableOpacity } from "react-native";
import { clsx } from "clsx";
import { Typography } from "@/src/components/ui";

type ButtonVariant = "primary" | "secondary" | "accent";
type ButtonSize = "sm" | "md";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  disabled?: boolean;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  size?: ButtonSize;
};

export function Button({
  title,
  onPress,
  disabled = false,
  variant = "primary",
  fullWidth,
  size = "md",
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={clsx(
        styles.base,
        styles.sizes[size],
        fullWidth && styles.fullWidth,
        styles.variants[variant],
        disabled && styles.disabled,
      )}
    >
      <Typography
        weight="regular"
        className={clsx(
          styles.textBase,
          styles.textVariants[variant],
          disabled && styles.textDisabled,
        )}
      >
        {title}
      </Typography>
    </TouchableOpacity>
  );
}

const styles = {
  base: "items-center justify-center rounded-medium",
  sizes: {
    sm: "h-[40px] px-3",
    md: "h-[50px] px-4",
  },
  fullWidth: "w-full",
  variants: {
    primary: "bg-primary",
    secondary: "bg-secondary",
    accent: "bg-accent",
  },
  disabled: "bg-secondary/50",
  textBase: "text-body font-inter-semibold",
  textVariants: {
    primary: "text-light",
    secondary: "text-dark",
    accent: "text-light",
  },
  textDisabled: "text-textDisabled",
};
