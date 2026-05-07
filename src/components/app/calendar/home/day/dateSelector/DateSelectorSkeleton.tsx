import React, { useMemo } from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";

import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const ITEM_WIDTH = 44;
const ITEM_GAP = 12;
const DATE_CIRCLE_SIZE = 60;
const LOADER_SPEED = 1.2;
const LOADER_BG = colors.neutral[100];
const LOADER_FG = "#F5F5FA";

const ITEM_TOP_OFFSET = 0;
const ITEM_HEIGHT = 70;
const MIN_VISIBLE_ITEMS = 6;
const MAX_VISIBLE_ITEMS = 7;

const DateSelectorSkeleton = () => {
  const { width } = useWindowDimensions();

  const itemCount = useMemo(() => {
    const availableWidth = width - SCREEN_PADDING * 2 + ITEM_GAP;
    const possibleItems = Math.floor(availableWidth / (ITEM_WIDTH + ITEM_GAP));

    return Math.min(
      MAX_VISIBLE_ITEMS,
      Math.max(MIN_VISIBLE_ITEMS, possibleItems),
    );
  }, [width]);

  const contentWidth = width;
  const contentHeight = ITEM_TOP_OFFSET + ITEM_HEIGHT;

  return (
    <View className="gap-2">
      <ContentLoader
        speed={LOADER_SPEED}
        width={contentWidth}
        height={contentHeight}
        backgroundColor={LOADER_BG}
        foregroundColor={LOADER_FG}
      >
        {Array.from({ length: itemCount }).map((_, index) => {
          const itemX = SCREEN_PADDING + index * (ITEM_WIDTH + ITEM_GAP);
          const circleX = itemX + (ITEM_WIDTH - DATE_CIRCLE_SIZE) / 2;

          return (
            <React.Fragment key={index}>
              <Rect
                x={circleX}
                y={ITEM_TOP_OFFSET}
                rx={24}
                ry={24}
                width={42}
                height={60}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </View>
  );
};

export default DateSelectorSkeleton;
