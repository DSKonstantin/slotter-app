import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { SCREEN_PADDING } from "@/src/constants/layout";
import {
  LEFT_COL,
  RIGHT_GAP,
  HOUR_HEIGHT,
  LOADER_SPEED,
  BG,
  FG,
  SKELETON_ROW_COUNT,
} from "./constants";

const TimeSlotListSkeleton = ({ bottomInset }: { bottomInset: number }) => {
  const { width } = useWindowDimensions();
  const contentWidth = width - SCREEN_PADDING * 2;
  const rightColWidth = contentWidth - LEFT_COL - RIGHT_GAP;
  const totalHeight = HOUR_HEIGHT * SKELETON_ROW_COUNT;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 pt-4 px-screen"
      contentContainerStyle={{ paddingBottom: bottomInset + 80 }}
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

        {Array.from({ length: SKELETON_ROW_COUNT }).map((_, i) => {
          const rowY = i * HOUR_HEIGHT;
          return (
            <React.Fragment key={i}>
              <Rect x={0} y={rowY + 2} rx={4} ry={4} width={32} height={12} />
              <Rect
                x={LEFT_COL + RIGHT_GAP}
                y={rowY + 1}
                rx={14}
                ry={14}
                width={rightColWidth}
                height={HOUR_HEIGHT - 2}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </ScrollView>
  );
};

export default TimeSlotListSkeleton;
