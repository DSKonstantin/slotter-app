import { Animated, Pressable, Text } from "react-native";
import { twMerge } from "tailwind-merge";

interface CustomBtn {
  title: string;
  onPress: () => void;
  size?: "sm" | "md";
  variant?: "primary" | "secondary" | "clear";
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
  const backgroundColorRef = new Animated.Value(0);

  const handlePress = () => {
    Animated.timing(backgroundColorRef, {
      toValue: 1,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

  const handleRelease = () => {
    Animated.timing(backgroundColorRef, {
      toValue: 0,
      duration: 60,
      useNativeDriver: true,
    }).start();
  };

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
          disabled && styles.disabled,
        )}
        style={{ backgroundColor }}
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
      to: "#3C3C3C",
    },
    secondary: {
      from: "#E5E7EB",
      to: "#D1D5DB",
    },
    clear: {
      from: "transparent",
      to: "rgba(0,0,0,0.06)",
    },
  },
  disabled: "bg-secondary/50",
  textBase: "font-inter-semibold text-body",
  textVariants: {
    primary: "text-secondary",
    secondary: "text-dark",
    clear: "text-primary",
  },
  textDisabled: "text-textDisabled",
};
