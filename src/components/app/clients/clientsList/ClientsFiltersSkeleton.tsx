import React from "react";
import { View } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const PILL_HEIGHT = 36;
const PILL_RADIUS = 18;
const GAP = 8;
const PILL_WIDTHS = [56, 84, 100, 72, 64];

const totalWidth =
  PILL_WIDTHS.reduce((sum, w) => sum + w, 0) + GAP * (PILL_WIDTHS.length - 1);

const ClientsFiltersSkeleton = () => {
  return (
    <View
      style={{
        paddingHorizontal: SCREEN_PADDING,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={totalWidth}
        height={PILL_HEIGHT}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {
          PILL_WIDTHS.reduce<{ x: number; rects: React.ReactNode[] }>(
            (acc, width, i) => {
              acc.rects.push(
                <Rect
                  key={i}
                  x={acc.x}
                  y={0}
                  rx={PILL_RADIUS}
                  ry={PILL_RADIUS}
                  width={width}
                  height={PILL_HEIGHT}
                />,
              );
              acc.x += width + GAP;
              return acc;
            },
            { x: 0, rects: [] },
          ).rects
        }
      </ContentLoader>
    </View>
  );
};

export default ClientsFiltersSkeleton;
