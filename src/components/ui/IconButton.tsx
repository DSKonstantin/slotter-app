import { ReactNode } from "react";
import { TouchableOpacity } from "react-native";
import { twMerge } from "tailwind-merge";

type IconButtonSize = "sm" | "md" | "lg";

type IconButtonProps = {
  icon: ReactNode;
  onPress?: () => void;
  size?: IconButtonSize;
  disabled?: boolean;
  buttonClassName?: string;
};

export function IconButton({
  icon,
  onPress,
  size = "md",
  disabled,
  buttonClassName,
}: IconButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      className={twMerge(
        styles.base,
        styles.size[size],
        disabled && "opacity-30",
        buttonClassName,
      )}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = {
  base: "items-center justify-center rounded-full bg-background-surface",
  size: {
    lg: "h-[62px] w-[62px]",
    md: "h-[48px] w-[48px]",
    sm: "h-[36px] w-[36px]",
  },
};
