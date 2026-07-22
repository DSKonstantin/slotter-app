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

/**
 * Owns the scroll offset feeding CollapsibleHeader. Attach `onScroll` to the
 * screen's Animated.ScrollView and pass `scrollY` to the component.
 */
export function useCollapsibleHeaderScroll() {
  const scrollY = useSharedValue(0);
  const maxScrollY = useSharedValue(0);

  const onScroll = useAnimatedScrollHandler((e) => {
    // Clamp to the scrollable range so iOS bounce doesn't produce fake deltas.
    const maxY = Math.max(0, e.contentSize.height - e.layoutMeasurement.height);
    maxScrollY.value = maxY;
    scrollY.value = Math.min(Math.max(e.contentOffset.y, 0), maxY);
  });

  return { scrollY, maxScrollY, onScroll };
}

type CollapsibleHeaderProps = {
  /** Clamped scroll offset from useCollapsibleHeaderScroll. */
  scrollY: SharedValue<number>;
  /** Scrollable range from useCollapsibleHeaderScroll. */
  maxScrollY: SharedValue<number>;
  /** True when a static header is rendered above — adjusts vertical padding. */
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
  // Collapsing the header resizes the scroll view, which shifts contentOffset
  // and fires scroll events that would immediately toggle the header back
  // (feedback loop). Ignore scroll input while the show/hide animation runs.
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

      // Hiding grows the viewport by the header height; if the scrollable
      // range is smaller than that, the offset would collapse to 0 and
      // re-show the header in a loop. Skip hiding for barely-scrollable
      // content — there is no space to reclaim anyway.
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
