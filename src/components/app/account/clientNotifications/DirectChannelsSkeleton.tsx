import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect, Circle } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_PADDING = 16;
const ROW_HEIGHT = 46;
const ROW_GAP = 33; // Divider my-4: 16 + 1 + 16
const COUNT = 2;
const ICON = 28;
const TEXT_RADIUS = 8;

// Скелетон строк прямых каналов (Telegram / Макс) внутри карточки
const DirectChannelsSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2 - CARD_PADDING * 2;
  const totalH = COUNT * ROW_HEIGHT + (COUNT - 1) * ROW_GAP;

  return (
    <View>
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {Array.from({ length: COUNT }).map((_, i) => {
          const y = i * (ROW_HEIGHT + ROW_GAP);

          return (
            <React.Fragment key={i}>
              <Circle cx={ICON / 2} cy={y + ICON / 2} r={ICON / 2} />
              <Rect
                x={ICON + 6}
                y={y + 7}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={90 + (i % 2) * 20}
                height={14}
              />
              <Rect
                x={0}
                y={y + ROW_HEIGHT - 12}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={120}
                height={12}
              />
              <Rect
                x={w - 90}
                y={y + 18}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={90}
                height={14}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </View>
  );
};

export default DirectChannelsSkeleton;
