import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const HEADER_HEIGHT = 48;
const HEADER_WIDTH = 220;
const HEADER_GAP = 20;
const CALENDAR_HEIGHT = 372;

const ScheduleSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = Math.floor(width - SCREEN_PADDING * 2);
  const calendarY = HEADER_HEIGHT + HEADER_GAP;
  const totalH = calendarY + CALENDAR_HEIGHT;

  return (
    <View className="flex-1">
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect
          x={(w - HEADER_WIDTH) / 2}
          y={0}
          rx={HEADER_HEIGHT / 2}
          ry={HEADER_HEIGHT / 2}
          width={HEADER_WIDTH}
          height={HEADER_HEIGHT}
        />

        <Rect
          x={0}
          y={calendarY}
          rx={20}
          ry={20}
          width={w}
          height={CALENDAR_HEIGHT}
        />
      </ContentLoader>
    </View>
  );
};

export default ScheduleSkeleton;
