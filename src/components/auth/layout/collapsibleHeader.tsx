import { ReactNode, useCallback } from "react";
import { View, type LayoutChangeEvent } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  type SharedValue,
  useAnimatedReaction,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const HIDE_SCROLL_THRESHOLD = 8;

export function useCollapsibleHeaderScroll() {
  const scrollY = useSharedValue(0);
  const maxScrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    const maxY = Math.max(0, e.contentSize.height - e.layoutMeasurement.height);
    maxScrollY.value = maxY;
    scrollY.value = Math.min(Math.max(e.contentOffset.y, 0), maxY);
  });

  return { scrollY, maxScrollY, onScroll };
}

type CollapsibleHeaderProps = {
  scrollY: SharedValue<number>;
  maxScrollY: SharedValue<number>;
  hasHeaderAbove: boolean;
  children: ReactNode;
};

export function CollapsibleHeader({
  scrollY,
  maxScrollY,
  hasHeaderAbove,
  children,
}: CollapsibleHeaderProps) {
  const height = useSharedValue(0);
  const visible = useSharedValue(1);
  const scrollAccumulated = useSharedValue(0);
  const shown = useSharedValue(true);
  const animating = useSharedValue(false);

  const handleLayout = useCallback(
    (e: LayoutChangeEvent) => {
      height.value = e.nativeEvent.layout.height;
    },
    [height],
  );

  useAnimatedReaction(
    () => scrollY.value,
    (y, prevY) => {
      const setShown = (next: boolean) => {
        if (shown.value === next) return;
        shown.value = next;
        scrollAccumulated.value = 0;
        animating.value = true;
        visible.value = withTiming(
          next ? 1 : 0,
          { duration: 200 },
          (finished) => {
            if (finished) {
              animating.value = false;
            }
          },
        );
      };

      if (y <= 0) {
        scrollAccumulated.value = 0;
        setShown(true);
        return;
      }

      if (animating.value) return;

      const delta = y - (prevY ?? y);

      if (Math.sign(delta) !== Math.sign(scrollAccumulated.value)) {
        scrollAccumulated.value = 0;
      }
      scrollAccumulated.value += delta;

      const canHide = maxScrollY.value > height.value + HIDE_SCROLL_THRESHOLD;

      if (scrollAccumulated.value > HIDE_SCROLL_THRESHOLD && canHide) {
        setShown(false);
      } else if (scrollAccumulated.value < -HIDE_SCROLL_THRESHOLD) {
        setShown(true);
      }
    },
  );

  const animatedStyle = useAnimatedStyle(() => ({
    marginTop: -(1 - visible.value) * height.value,
    opacity: interpolate(
      visible.value,
      [0, 0.6, 1],
      [0, 0, 1],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <Animated.View style={[animatedStyle, { overflow: "hidden" }]}>
      <View
        className={`px-screen ${hasHeaderAbove ? "pb-2" : "py-2"}`}
        onLayout={handleLayout}
      >
        {children}
      </View>
    </Animated.View>
  );
}
