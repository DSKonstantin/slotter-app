import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

import {
  DATE_CIRCLE_SIZE,
  HORIZONTAL_PADDING,
  ITEM_GAP,
  ITEM_WIDTH,
  LOADER_BG,
  LOADER_FG,
  LOADER_SPEED,
} from "./constants";

const HEADER_WIDTH = 108;
const HEADER_HEIGHT = 12;
const DAY_LABEL_WIDTH = 20;
const DAY_LABEL_HEIGHT = 10;
const HEADER_BOTTOM_GAP = 16;
const ITEM_TOP_OFFSET = HEADER_HEIGHT + HEADER_BOTTOM_GAP;
const ITEM_HEIGHT = 56;
const ITEM_BOTTOM_PADDING = 6;
const MIN_VISIBLE_ITEMS = 6;
const MAX_VISIBLE_ITEMS = 7;

const DateSelectorSkeleton = () => {
  const { width } = useWindowDimensions();

  const itemCount = useMemo(() => {
    const availableWidth = width - HORIZONTAL_PADDING * 2 + ITEM_GAP;
    const possibleItems = Math.floor(availableWidth / (ITEM_WIDTH + ITEM_GAP));

    return Math.min(
      MAX_VISIBLE_ITEMS,
      Math.max(MIN_VISIBLE_ITEMS, possibleItems),
    );
  }, [width]);

  const contentWidth = width;
  const contentHeight = ITEM_TOP_OFFSET + ITEM_HEIGHT + ITEM_BOTTOM_PADDING;

  return (
    <View className="gap-2">
      <ContentLoader
        speed={LOADER_SPEED}
        width={contentWidth}
        height={contentHeight}
        backgroundColor={LOADER_BG}
        foregroundColor={LOADER_FG}
      >
        <Rect
          x={(contentWidth - HEADER_WIDTH) / 2}
          y={0}
          rx={6}
          ry={6}
          width={HEADER_WIDTH}
          height={HEADER_HEIGHT}
        />

        {Array.from({ length: itemCount }).map((_, index) => {
          const itemX = HORIZONTAL_PADDING + index * (ITEM_WIDTH + ITEM_GAP);
          const labelX = itemX + (ITEM_WIDTH - DAY_LABEL_WIDTH) / 2;
          const circleX = itemX + (ITEM_WIDTH - DATE_CIRCLE_SIZE) / 2;

          return (
            <React.Fragment key={index}>
              <Rect
                x={labelX}
                y={ITEM_TOP_OFFSET}
                rx={5}
                ry={5}
                width={DAY_LABEL_WIDTH}
                height={DAY_LABEL_HEIGHT}
              />
              <Rect
                x={circleX}
                y={ITEM_TOP_OFFSET + 18}
                rx={DATE_CIRCLE_SIZE / 2}
                ry={DATE_CIRCLE_SIZE / 2}
                width={DATE_CIRCLE_SIZE}
                height={DATE_CIRCLE_SIZE}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </View>
  );
};

export default DateSelectorSkeleton;
