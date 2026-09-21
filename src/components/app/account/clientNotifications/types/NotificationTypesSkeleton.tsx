import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { STAGE_ORDER } from "@/src/components/app/account/clientNotifications/stageTitles";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const ROW_HEIGHT = 60;
const TEXT_RADIUS = 7;

// Реальное распределение шести видов по стадиям: booking 2, before 3, retention 1.
const ROWS_PER_STAGE: Record<(typeof STAGE_ORDER)[number], number> = {
  booking: 2,
  before: 3,
  retention: 1,
};

const NotificationTypesSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;

  return (
    <View>
      {STAGE_ORDER.map((stage) => {
        const rowCount = ROWS_PER_STAGE[stage];
        const height = rowCount * ROW_HEIGHT;

        return (
          <View key={stage} className="mb-5">
            <Rect
              x={0}
              y={0}
              rx={TEXT_RADIUS}
              ry={TEXT_RADIUS}
              width={90}
              height={12}
            />
            <View className="h-2" />
            <ContentLoader
              speed={SPEED}
              width={w}
              height={height}
              backgroundColor={BG}
              foregroundColor={FG}
            >
              {Array.from({ length: rowCount }).map((_, i) => {
                const y = i * ROW_HEIGHT;
                return (
                  <React.Fragment key={i}>
                    <Rect
                      x={0}
                      y={y + 18}
                      rx={TEXT_RADIUS}
                      ry={TEXT_RADIUS}
                      width={160}
                      height={14}
                    />
                    <Rect
                      x={0}
                      y={y + 38}
                      rx={TEXT_RADIUS}
                      ry={TEXT_RADIUS}
                      width={90}
                      height={12}
                    />
                  </React.Fragment>
                );
              })}
            </ContentLoader>
          </View>
        );
      })}
    </View>
  );
};

export default NotificationTypesSkeleton;
