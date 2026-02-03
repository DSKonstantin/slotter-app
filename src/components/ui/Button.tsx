import { memo, useCallback, useMemo, useRef } from "react";
import { Animated, Pressable, PressableProps, Text } from "react-native";
import { twMerge } from "tailwind-merge";

export interface CustomBtn {
  title: string;
  onPress: () => void;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "accent" | "clear";
  textVariant?: "default" | "accent";
  direction?: "horizontal" | "vertical";

  fullWidth?: boolean;
  disabled?: boolean;

  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;

  buttonProps?: PressableProps;
  containerClassName?: string;
  textClassName?: string;
}

export const ButtonComponent: React.FC<CustomBtn> = ({
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
  const anim = useRef(new Animated.Value(0)).current;

  const handlePressIn = useCallback(() => {
    if (disabled) return;
    Animated.timing(anim, {
      toValue: 1,
      duration: 60,
      useNativeDriver: true,
    }).start();
  }, [anim, disabled]);

  const handlePressOut = useCallback(() => {
    if (disabled) return;
    Animated.timing(anim, {
      toValue: 0,
      duration: 60,
      useNativeDriver: true,
    }).start();
  }, [anim, disabled]);

  const opacity = useMemo(() => {
    return anim.interpolate({ inputRange: [0, 1], outputRange: [1, 0.7] });
  }, [anim]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      {...buttonProps}
    >
      <Animated.View
        className={twMerge(
          styles.base,
          styles.sizes[size],
          styles.directions[direction],
          styles.bgColors[variant],
          containerClassName,
        )}
        style={{
          opacity: disabled ? 0.4 : opacity,
        }}
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
      </Animated.View>
    </Pressable>
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

export const Button = memo(ButtonComponent);
