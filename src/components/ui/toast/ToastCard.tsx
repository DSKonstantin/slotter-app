import { useEffect, type ReactNode } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import { Typography } from "@/src/components/ui/Typography";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";
import type { ToastVariant } from "./toast";
import { TOAST_ICON_PATHS, TOAST_ICON_VIEWBOX } from "./icons";

const ICON_SIZE = 24;

const ICON_COLORS: Record<ToastVariant, string> = {
  success: colors.primary.green[400],
  security: colors.primary.green[400],
  error: colors.accent.red[500],
  loading: colors.primary.green[500],
};

function ToastIcon({ variant }: { variant: ToastVariant }) {
  if (variant === "loading")
    return (
      <StSvg name="Progress" size={ICON_SIZE} color={ICON_COLORS.loading} />
    );

  const { base, marks } = TOAST_ICON_PATHS[variant];
  return (
    <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox={TOAST_ICON_VIEWBOX}>
      <Path d={base} fill={ICON_COLORS[variant]} />
      {marks.map((d) => (
        <Path key={d} d={d} fill={colors.neutral[0]} />
      ))}
    </Svg>
  );
}

function Spinning({ children }: { children: ReactNode }) {
  const rotation = useSharedValue(0);

  const style = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 3500, easing: Easing.linear }),
      -1,
    );
  }, [rotation]);

  return <Animated.View style={style}>{children}</Animated.View>;
}

type ToastCardProps = {
  variant: ToastVariant;
  message: string;
};

export function ToastCard({ variant, message }: ToastCardProps) {
  const { width } = useWindowDimensions();
  const isError = variant === "error";
  const icon = <ToastIcon variant={variant} />;

  return (
    <View
      role="status"
      aria-live={isError ? "assertive" : "polite"}
      accessibilityRole="alert"
      accessibilityLiveRegion={isError ? "assertive" : "polite"}
      style={[styles.shadowWrap, { maxWidth: width - SCREEN_PADDING * 2 }]}
    >
      <View style={styles.borderPad}>
        <LinearGradient
          colors={["rgba(255,255,255,0.6)", "rgba(255,255,255,0.2)"]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.inner} collapsable={false}>
          <BlurView
            intensity={60}
            tint="dark"
            style={StyleSheet.absoluteFill}
          />
          <LinearGradient
            colors={["rgba(17,17,17,0.6)", "rgba(119,119,119,0.6)"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 0, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.content}>
            {variant === "loading" ? <Spinning>{icon}</Spinning> : icon}
            <Typography weight="medium" style={styles.text}>
              {message}
            </Typography>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowWrap: {
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
    alignItems: "flex-start",
    gap: 8,
    paddingTop: 12,
    paddingBottom: 12,
    paddingLeft: 16,
    paddingRight: 20,
  },
  text: {
    flexShrink: 1,
    marginTop: 2,
    fontSize: 14,
    lineHeight: 20,
    color: "#FFFFFF",
  },
});
