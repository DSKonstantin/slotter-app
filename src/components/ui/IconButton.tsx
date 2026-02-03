import { ReactNode } from "react";
import { Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

type IconButtonSize = "sm" | "md";

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
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={twMerge(styles.base, styles.size[size], buttonClassName)}
    >
      {icon}
    </Pressable>
  );
}

const styles = {
  base: "items-center justify-center rounded-full bg-white/80",
  size: {
    md: "h-[48px] w-[48px]",
    sm: "h-[36px] w-[36px]",
  },
};
