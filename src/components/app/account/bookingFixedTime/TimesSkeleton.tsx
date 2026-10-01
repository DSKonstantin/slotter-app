import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const COLUMNS = 4;
const ROWS = 5;
const GAP = 8;
const CHIP_HEIGHT = 36;
const CAPTION_HEIGHT = 14;
const CAPTION_GAP = 12;

const TimesSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const chipWidth = (w - GAP * (COLUMNS - 1)) / COLUMNS;
  const height =
    CAPTION_HEIGHT + CAPTION_GAP + ROWS * CHIP_HEIGHT + (ROWS - 1) * GAP;

  return (
    <View>
      <ContentLoader
        speed={SPEED}
        width={w}
        height={height}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect
          x={0}
          y={0}
          rx={7}
          ry={7}
          width={w * 0.6}
          height={CAPTION_HEIGHT}
        />
        {Array.from({ length: ROWS * COLUMNS }).map((_, i) => (
          <Rect
            key={i}
            x={(i % COLUMNS) * (chipWidth + GAP)}
            y={
              CAPTION_HEIGHT +
              CAPTION_GAP +
              Math.floor(i / COLUMNS) * (CHIP_HEIGHT + GAP)
            }
            rx={CHIP_HEIGHT / 2}
            ry={CHIP_HEIGHT / 2}
            width={chipWidth}
            height={CHIP_HEIGHT}
          />
        ))}
      </ContentLoader>
    </View>
  );
};

export default TimesSkeleton;
