import React, { useEffect, useImperativeHandle, useState } from "react";
import { LayoutChangeEvent, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Extrapolation,
  interpolate,
  SharedValue,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatApiDate, formatShortDayName } from "@/src/utils/date/formatDate";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import { useToday } from "@/src/hooks/useToday";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import SpecialistHomeAssistant from "@/src/components/app/root/homeOverview/specialistHomeAssistant";
// import NotificationBanners from "@/src/components/app/root/notificationBanners";

const TAP_SLOP = 4;
const VELOCITY_THRESHOLD = 500;
const EXPANDED_TOP_INSET = 16;
const SPRING_CONFIG = { damping: 30, stiffness: 250, overshootClamping: true };
const GLOW_RAISE = 8;
const GLOW_HEIGHT = 25 + GLOW_RAISE;
const GLOW_LOCATIONS = [0, 0.05, 0.3, 0.45, 0.75, 1] as const;
const GLOW_COLORS = [
  "rgba(200,246,96,0.04)",
  "rgba(200,246,96,0.06)",
  "rgba(200,246,96,0.1)",
  "rgba(200,246,96,0.14)",
  "rgba(200,246,96,0.16)",
  "rgba(200,246,96,0.16)",
] as const;

export type HomeOverviewHandle = {
  collapse: () => void;
};

type Props = {
  ref?: React.Ref<HomeOverviewHandle>;
  statsHeight: number;
  containerHeight: number;
  onExpandedChange?: (expanded: boolean) => void;
};

const HomeOverview = ({
  ref,
  statsHeight,
  containerHeight,
  onExpandedChange,
}: Props) => {
  const [handleHeight, setHandleHeight] = useState(20);

  const restOffset = useSharedValue(0);
  const translateY = useSharedValue(2000);
  const startY = useSharedValue(0);
  const hasMeasured = useSharedValue(false);
  const isExpanded = useSharedValue(false);

  const today = useToday();

  const timeChip = `Сегодня • ${formatShortDayName(today)} • ${formatDayMonth(
    formatApiDate(today),
  )}`;

  const notifyExpanded = (expanded: boolean) => {
    onExpandedChange?.(expanded);
  };

  const pan = Gesture.Pan()
    .onStart(() => {
      startY.value = translateY.value;
    })
    .onUpdate((e) => {
      const next = startY.value + e.translationY;
      translateY.value = Math.min(
        Math.max(next, EXPANDED_TOP_INSET),
        restOffset.value,
      );
    })
    .onEnd((e) => {
      const dragged = Math.abs(e.translationY);
      const wasExpanded = startY.value < restOffset.value / 2;

      let shouldExpand: boolean;
      if (dragged < TAP_SLOP) {
        shouldExpand = !wasExpanded;
      } else if (Math.abs(e.velocityY) > VELOCITY_THRESHOLD) {
        shouldExpand = e.velocityY < 0;
      } else {
        shouldExpand = translateY.value < restOffset.value / 2;
      }

      isExpanded.value = shouldExpand;
      translateY.value = withSpring(
        shouldExpand ? EXPANDED_TOP_INSET : restOffset.value,
        {
          ...SPRING_CONFIG,
          velocity: e.velocityY,
        },
      );
      scheduleOnRN(notifyExpanded, shouldExpand);
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      translateY.value,
      [EXPANDED_TOP_INSET, restOffset.value],
      [1, 0],
      Extrapolation.CLAMP,
    ),
    transform: [{ translateY: translateY.value - GLOW_RAISE }],
  }));

  useImperativeHandle(ref, () => ({
    collapse: () => {
      if (!hasMeasured.value) return;
      isExpanded.value = false;
      translateY.value = withSpring(restOffset.value, SPRING_CONFIG);
      notifyExpanded(false);
    },
  }));

  useEffect(() => {
    if (statsHeight <= 0) return;
    restOffset.value = statsHeight;
    if (!hasMeasured.value) {
      hasMeasured.value = true;
      translateY.value = statsHeight;
    } else if (!isExpanded.value) {
      translateY.value = statsHeight;
    }
  }, [statsHeight, restOffset, translateY, hasMeasured, isExpanded]);

  return (
    <>
      <Animated.View
        pointerEvents="none"
        className="absolute top-0 left-0 right-0"
        style={[{ height: GLOW_HEIGHT }, glowStyle]}
      >
        <LinearGradient
          colors={GLOW_COLORS}
          locations={GLOW_LOCATIONS}
          style={{ flex: 1 }}
        />
      </Animated.View>

      <Animated.View
        style={[
          {
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 10,
            elevation: 10,
          },
          animatedStyle,
        ]}
        className="bg-background-surface rounded-t-large overflow-hidden"
      >
        <GestureDetector gesture={pan}>
          <View
            className="items-center py-2"
            onLayout={(e: LayoutChangeEvent) =>
              setHandleHeight(e.nativeEvent.layout.height)
            }
          >
            <View className="w-20 h-1 rounded-full bg-neutral-300" />
          </View>
        </GestureDetector>

        <ContentBody
          timeChip={timeChip}
          translateY={translateY}
          containerHeight={containerHeight}
          handleHeight={handleHeight}
        />
      </Animated.View>
    </>
  );
};

type ContentBodyProps = {
  timeChip: string;
  translateY: SharedValue<number>;
  containerHeight: number;
  handleHeight: number;
};

const ContentBody = ({
  timeChip,
  translateY,
  containerHeight,
  handleHeight,
}: ContentBodyProps) => {
  const { bottom } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const visibleHeightStyle = useAnimatedStyle(() => ({
    height: Math.max(containerHeight - translateY.value - handleHeight, 0),
  }));

  return (
    <Animated.View
      className="px-screen gap-3"
      style={[{ paddingBottom: tabBarHeight + bottom }, visibleHeightStyle]}
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

      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <SpecialistHomeAssistant />
      </ScrollView>

      {/*<NotificationBanners />*/}
    </Animated.View>
  );
};

export default HomeOverview;
