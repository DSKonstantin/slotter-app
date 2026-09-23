import React, {
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import BottomSheet, {
  BottomSheetScrollView,
  useBottomSheet,
} from "@gorhom/bottom-sheet";
import Svg, { Path } from "react-native-svg";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatApiDate, formatShortDayName } from "@/src/utils/date/formatDate";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import { useToday } from "@/src/hooks/useToday";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import { TAB_BAR_BOTTOM_GAP } from "@/src/constants/tabs";
import SpecialistHomeAssistant from "@/src/components/app/root/homeOverview/specialistHomeAssistant";
// import NotificationBanners from "@/src/components/app/root/notificationBanners";

const EXPANDED_TOP_INSET = 16;
// Matches the `marginTop` set on Home's carousel/stats ScrollView (root/index.tsx).
const CAROUSEL_TOP_OFFSET = 8;
// Matches that ScrollView's `contentContainerStyle.paddingBottom` (root/index.tsx).
const CONTENT_BOTTOM_PADDING = 8;
// Visual gap left below InsightsCarousel when the sheet is fully raised,
// matching the `pt-[16px]` gap already baked into the stats wrapper.
const CAROUSEL_BOTTOM_GAP = 16;
const SPRING_CONFIG = { damping: 30, stiffness: 250, overshootClamping: true };
const GLOW_RAISE = 8;
const GLOW_HEIGHT = 25 + GLOW_RAISE;
const GLOW_FADE_DURATION = 220;
const GLOW_LOCATIONS = [0, 0.05, 0.3, 0.45, 0.75, 1] as const;
const GLOW_COLORS = [
  "rgba(200,246,96,0.04)",
  "rgba(200,246,96,0.06)",
  "rgba(200,246,96,0.1)",
  "rgba(200,246,96,0.14)",
  "rgba(200,246,96,0.16)",
  "rgba(200,246,96,0.16)",
] as const;
const COLLAPSED_INDEX = 0;
const EXPANDED_INDEX = 1;
const HANDLE_GLYPH_WIDTH = 60;
const HANDLE_GLYPH_HEIGHT = 11;
const HANDLE_GLYPH_PATH =
  "M0 7.46542C0 9.29402 1.64195 10.685 3.44567 10.3843L29.5068 6.04082C29.8333 5.98639 30.1667 5.98639 30.4932 6.04082L56.5543 10.3843C58.358 10.685 60 9.29402 60 7.46542C60 6.01886 58.9542 4.78432 57.5273 4.5465L30.4932 0.0408182C30.1667 -0.013607 29.8333 -0.013607 29.5068 0.0408173L2.47269 4.5465C1.04581 4.78432 0 6.01886 0 7.46542Z";

export type HomeOverviewHandle = {
  collapse: () => void;
  expand: () => void;
};

const Handle = () => {
  const { animatedIndex } = useBottomSheet();

  const pillStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [COLLAPSED_INDEX, EXPANDED_INDEX],
      [0, 1],
      Extrapolation.CLAMP,
    ),
  }));
  const glyphStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      animatedIndex.value,
      [COLLAPSED_INDEX, EXPANDED_INDEX],
      [1, 0],
      Extrapolation.CLAMP,
    ),
  }));

  return (
    <View className="items-center justify-center py-2 h-9">
      <Animated.View className="absolute" style={pillStyle}>
        <View className="w-[60px] h-[6px] rounded-full bg-background" />
      </Animated.View>
      <Animated.View className="absolute" style={glyphStyle}>
        <Svg
          width={HANDLE_GLYPH_WIDTH}
          height={HANDLE_GLYPH_HEIGHT}
          viewBox={`0 0 ${HANDLE_GLYPH_WIDTH} ${HANDLE_GLYPH_HEIGHT}`}
          fill="none"
        >
          <Path d={HANDLE_GLYPH_PATH} fill={colors.background.DEFAULT} />
        </Svg>
      </Animated.View>
    </View>
  );
};

type Props = {
  ref?: React.Ref<HomeOverviewHandle>;
  statsHeight: number;
  carouselHeight: number;
  containerHeight: number;
  onExpandedChange?: (expanded: boolean) => void;
};

const HomeOverview = ({
  ref,
  statsHeight,
  carouselHeight,
  containerHeight,
  onExpandedChange,
}: Props) => {
  const bottomSheetRef = useRef<React.ComponentRef<typeof BottomSheet>>(null);

  const glowOpacity = useSharedValue(1);
  const today = useToday();
  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const { collapsedHeight, expandedHeight } = useMemo(() => {
    // The sheet must never rise above the bottom edge of InsightsCarousel,
    // regardless of snap index — it may only ever cover HomeStats.
    const maxHeight = Math.max(
      containerHeight -
        CAROUSEL_TOP_OFFSET -
        carouselHeight -
        CAROUSEL_BOTTOM_GAP,
      0,
    );

    return {
      collapsedHeight: Math.max(
        containerHeight -
          CAROUSEL_TOP_OFFSET -
          carouselHeight -
          statsHeight -
          CONTENT_BOTTOM_PADDING,
        0,
      ),
      expandedHeight: Math.min(
        Math.max(containerHeight - EXPANDED_TOP_INSET, 0),
        maxHeight,
      ),
    };
  }, [containerHeight, statsHeight, carouselHeight]);

  const snapPoints = useMemo(
    () => [collapsedHeight, expandedHeight],
    [collapsedHeight, expandedHeight],
  );

  // The glow sits just above the sheet's current top edge when expanded.
  const glowTop = containerHeight - expandedHeight - GLOW_RAISE;

  const handleChange = useCallback(
    (nextIndex: number) => {
      const expanded = nextIndex === EXPANDED_INDEX;
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      glowOpacity.value = withTiming(expanded ? 1 : 0, {
        duration: GLOW_FADE_DURATION,
      });
      onExpandedChange?.(expanded);
    },
    [glowOpacity, onExpandedChange],
  );

  const timeChip = `Сегодня • ${formatShortDayName(today)} • ${formatDayMonth(
    formatApiDate(today),
  )}`;
  const isReady = statsHeight > 0 && carouselHeight > 0 && containerHeight > 0;

  useImperativeHandle(ref, () => ({
    collapse: () => {
      bottomSheetRef.current?.snapToIndex(COLLAPSED_INDEX);
    },
    expand: () => {
      bottomSheetRef.current?.snapToIndex(EXPANDED_INDEX);
    },
  }));

  if (!isReady) return null;

  return (
    <>
      <Animated.View
        pointerEvents="none"
        className="absolute left-0 right-0"
        style={[{ top: glowTop, height: GLOW_HEIGHT }, glowStyle]}
      >
        <LinearGradient
          colors={GLOW_COLORS}
          locations={GLOW_LOCATIONS}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <BottomSheet
        ref={bottomSheetRef}
        index={EXPANDED_INDEX}
        snapPoints={snapPoints}
        topInset={EXPANDED_TOP_INSET}
        animationConfigs={SPRING_CONFIG}
        animateOnMount={false}
        enableDynamicSizing={false}
        handleComponent={Handle}
        backgroundStyle={{
          backgroundColor: colors.background.surface,
          borderTopLeftRadius: 36,
          borderTopRightRadius: 36,
        }}
        onChange={handleChange}
      >
        <ContentBody timeChip={timeChip} />
      </BottomSheet>
    </>
  );
};

type ContentBodyProps = {
  timeChip: string;
};

const ContentBody = ({ timeChip }: ContentBodyProps) => {
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  return (
    <View
      className="px-screen gap-3 flex-1"
      style={{ paddingBottom: tabBarHeight + bottom + TAB_BAR_BOTTOM_GAP }}
    >
      <View className="flex-row items-center gap-2 justify-center">
        <StSvg name="SlotterAI" size={14} color={colors.neutral[500]} />
        <Typography weight="semibold" className="text-caption text-neutral-500">
          Slotter AI
        </Typography>
      </View>

      <Typography className="text-caption text-neutral-900">
        {timeChip}
      </Typography>

      <BottomSheetScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
      >
        <SpecialistHomeAssistant />
      </BottomSheetScrollView>

      {/*<NotificationBanners />*/}
    </View>
  );
};

export default HomeOverview;
