import { Animated, Pressable, Text } from "react-native";
import { twMerge } from "tailwind-merge";
import { useCallback, useRef } from "react";

interface CustomBtn {
  title: string;
  onPress: () => void;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "accent" | "clear";
  fullWidth?: boolean;
  disabled?: boolean;
}

export const Button: React.FC<CustomBtn> = ({
  title,
  onPress,
  size = "md",
  variant = "primary",
  fullWidth = false,
  disabled = false,
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
    >
      <Animated.View
        className={twMerge(
          styles.base,
          styles.sizes[size],
          fullWidth && styles.fullWidth,
          disabled && styles.disabled[variant],
        )}
        style={{
          ...(!disabled && { backgroundColor }),
        }}
      >
        <Text
          className={[
            styles.textBase,
            styles.textVariants[variant],
            disabled && styles.textDisabled,
          ].join(" ")}
        >
          {title}
        </Text>
      </Animated.View>
    </Pressable>
  );
};

const styles = {
  base: "items-center justify-center rounded-medium",
  sizes: {
    sm: "h-[40px] px-3",
    md: "h-[50px] px-4",
  },
  fullWidth: "w-full",
  variants: {
    primary: {
      from: "#000000",
      to: "rgba(60, 60, 67, 0.6)",
    },
    secondary: {
      from: "#E5E7EB",
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
  textBase: "font-inter-semibold text-body",
  textVariants: {
    primary: "text-secondary",
    secondary: "text-dark",
    accent: "text-secondary",
    clear: "text-primary",
  },
  textDisabled: "text-textDisabled",
};
