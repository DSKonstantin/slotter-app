import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  H_PAD,
  LEFT_COL,
  RIGHT_GAP,
  HOUR_HEIGHT,
  LOADER_SPEED,
  BG,
  FG,
  SKELETON_ROWS,
} from "./constants";

const TimeSlotListSkeleton = () => {
  const { width } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const contentWidth = width - H_PAD * 2;
  const rightColWidth = contentWidth - LEFT_COL - RIGHT_GAP;
  const totalHeight = HOUR_HEIGHT * SKELETON_ROWS.length;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + bottom + 80 }}
      scrollEnabled={false}
    >
      <ContentLoader
        speed={LOADER_SPEED}
        width={contentWidth}
        height={totalHeight}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect x={LEFT_COL - 1} y={0} width={1} height={totalHeight} />

        {SKELETON_ROWS.map(({ card }, i) => {
          const rowY = i * HOUR_HEIGHT;
          return (
            <React.Fragment key={i}>
              <Rect x={0} y={rowY + 2} rx={4} ry={4} width={32} height={12} />
              {card && (
                <Rect
                  x={LEFT_COL + RIGHT_GAP}
                  y={rowY + card.topOffset}
                  rx={14}
                  ry={14}
                  width={Math.round(rightColWidth * card.widthRatio)}
                  height={card.height}
                />
              )}
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </ScrollView>
  );
};

export default TimeSlotListSkeleton;
