import { Animated, Pressable, PressableProps, Text, View } from "react-native";
import { twMerge } from "tailwind-merge";
import { useCallback, useRef } from "react";

interface CustomBtn {
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

export const Button: React.FC<CustomBtn> = ({
  title,
  onPress,
  size = "md",
  variant = "primary",
  textVariant = "default",
  direction = "horizontal",
  fullWidth = false,
  disabled = false,
  iconLeft,
  iconRight,
  buttonProps,
  containerClassName,
  textClassName,
}) => {
  const backgroundColorRef = useRef(new Animated.Value(0)).current;

  const handlePress = useCallback(() => {
    if (disabled) return;

    Animated.timing(backgroundColorRef, {
      toValue: 1,
      duration: 60,
      useNativeDriver: false,
    }).start();
  }, [backgroundColorRef, disabled]);

  const handleRelease = useCallback(() => {
    if (disabled) return;

    Animated.timing(backgroundColorRef, {
      toValue: 0,
      duration: 60,
      useNativeDriver: false,
    }).start();
  }, [backgroundColorRef, disabled]);

  const backgroundColor = backgroundColorRef.interpolate({
    inputRange: [0, 1],
    outputRange: [styles.variants[variant].from, styles.variants[variant].to],
  });

  return (
    <Pressable
      onPressIn={handlePress}
      onPressOut={handleRelease}
      onPress={onPress}
      {...buttonProps}
    >
      <Animated.View
        className={twMerge(
          styles.base,
          styles.sizes[size],
          styles.directions[direction],
          fullWidth && styles.fullWidth,
          disabled && styles.disabled[variant],
          containerClassName,
        )}
        style={{
          ...(!disabled && { backgroundColor }),
        }}
      >
        {iconLeft && <View>{iconLeft}</View>}
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
        {iconRight && <View>{iconRight}</View>}
      </Animated.View>
    </Pressable>
  );
};

const styles = {
  base: "items-center justify-center rounded-medium gap-1",
  directions: {
    horizontal: "flex-row",
    vertical: "flex-col",
  },
  sizes: {
    sm: "h-[40px] px-2",
    md: "h-[50px] px-2",
    lg: "h-[80px] px-2",
  },
  fullWidth: "",
  variants: {
    primary: {
      from: "#000000",
      to: "rgba(60, 60, 67, 0.6)",
    },
    secondary: {
      from: "#FFFFFF",
      to: "#E5E7EB",
    },
    accent: {
      from: "#0088FF",
      to: "rgba(34, 43, 89, 0.63)",
    },
    clear: {
      from: "transparent",
      to: "rgba(0,0,0,0.06)",
    },
  },
  disabled: {
    primary: "bg-[rgba(60,60,67,0.18)]",
    secondary: "bg-secondary",
    accent: "bg-[rgba(60,60,67,0.18)]",
    clear: "transparent",
  },
  textBase: "font-inter-semibold text-[16px] leading-[1.5]",
  textVariants: {
    primary: "text-secondary",
    secondary: "text-dark",
    accent: "text-secondary",
    clear: "text-primary",
  },
  textAccent: "text-accent",
  textDisabled: "text-gray-dark",
};
