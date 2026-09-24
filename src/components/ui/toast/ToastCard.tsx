import { StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useAnimatedStyle,
  type SharedValue,
} from "react-native-reanimated";
import { Typography } from "@/src/components/ui/Typography";
import { StSvg } from "@/src/components/ui/StSvg";
import { ErrorTriangleIcon } from "./icons";
import { TraceSpinner } from "./TraceSpinner";
import type { ToastVariant } from "./types";

const ICON_SIZE = 28;
const SUCCESS_COLOR = "#34C759";
const ERROR_COLOR = "#FF3B30";

function ToastGlassBackground() {
  return (
    <>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(17,17,17,0.6)", "rgba(119,119,119,0.6)"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 0, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
    </>
  );
}

function ToastIcon({ variant }: { variant: ToastVariant }) {
  switch (variant) {
    case "loading":
      return <TraceSpinner size={ICON_SIZE} color="#FFFFFF" />;
    case "error":
      return <ErrorTriangleIcon size={ICON_SIZE} color={ERROR_COLOR} />;
    case "security":
      return (
        <StSvg
          name="Chield_check_fill"
          size={ICON_SIZE}
          color={SUCCESS_COLOR}
        />
      );
    case "success":
    default:
      return (
        <StSvg name="Check_round_fill" size={ICON_SIZE} color={SUCCESS_COLOR} />
      );
  }
}

type ToastCardProps = {
  variant: ToastVariant;
  message: string;
  contentOpacity: SharedValue<number>;
};

export function ToastCard({
  variant,
  message,
  contentOpacity,
}: ToastCardProps) {
  const isError = variant === "error";

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  return (
    <View
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      accessibilityRole="alert"
      accessibilityLiveRegion={isError ? "assertive" : "polite"}
      style={styles.shadowWrap}
    >
      <View style={styles.borderPad}>
        <LinearGradient
          colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0.2)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.inner} collapsable={false}>
          <ToastGlassBackground />
          <Animated.View style={[styles.content, contentStyle]}>
            <ToastIcon variant={variant} />
            <Typography weight="medium" style={styles.text} numberOfLines={2}>
              {message}
            </Typography>
          </Animated.View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
    maxWidth: 356,
    borderRadius: 16,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 13 },
    shadowOpacity: 0.1,
    shadowRadius: 6.5,
    elevation: 8,
  },
  borderPad: {
    borderRadius: 16,
    padding: 1,
    overflow: "hidden",
  },
  inner: {
    borderRadius: 15,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingTop: 12,
    paddingRight: 20,
    paddingBottom: 12,
    paddingLeft: 16,
  },
  text: {
    flexShrink: 1,
    fontSize: 16,
    lineHeight: 24,
    letterSpacing: -0.32,
    color: "#FFFFFF",
  },
});
