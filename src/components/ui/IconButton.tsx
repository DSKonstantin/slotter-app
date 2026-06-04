import { ReactNode } from "react";
import {
  ActivityIndicator,
  TouchableOpacity,
  TouchableOpacityProps,
} from "react-native";
import { twMerge } from "tailwind-merge";
import { colors } from "@/src/styles/colors";

type IconButtonSize = "xs" | "sm" | "md" | "lg" | "xl" | "xxl";

type IconButtonProps = TouchableOpacityProps & {
  icon: ReactNode;
  size?: IconButtonSize;
  buttonClassName?: string;
  loading?: boolean;
};
export function IconButton({
  icon,
  onPress,
  size = "md",
  disabled,
  loading,
  buttonClassName,
  ...props
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
      className={twMerge(
        styles.base,
        styles.size[size],
        disabled && "opacity-30",
        buttonClassName,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={colors.neutral[500]} />
      ) : (
        icon
      )}
    </TouchableOpacity>
  );
}

const styles = {
  base: "items-center justify-center rounded-full bg-background-surface",
  size: {
    xxl: "h-[66px] w-[66px]",
    xl: "h-[62px] w-[62px]",
    lg: "h-[54px] w-[54px]",
    md: "h-[48px] w-[48px]",
    sm: "h-[36px] w-[36px]",
    xs: "h-[24px] w-[24px]",
  },
};
