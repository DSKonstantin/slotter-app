import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_RADIUS = 20;
const TEXT_RADIUS = 8;

const STAT_CARD_HEIGHT = 100;
const STAT_CARD_GAP = 8;
const STAT_ROWS_GAP = 8;
const STATS_TO_SERVICES_GAP = 24;

const SERVICES_CARD_PAD = 16;
const SERVICES_TITLE_HEIGHT = 18;
const SERVICES_ROW_HEIGHT = 18;
const SERVICES_ROW_GAP = 16;
const SERVICES_DIVIDER_HEIGHT = 1;
const SERVICES_ROWS = 4;

const ClientsStatisticsSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const cardW = (w - STAT_CARD_GAP) / 2;

  const statsTotalH = STAT_CARD_HEIGHT * 2 + STAT_ROWS_GAP;

  const servicesContentH =
    SERVICES_TITLE_HEIGHT +
    SERVICES_ROW_GAP +
    SERVICES_DIVIDER_HEIGHT +
    SERVICES_ROW_GAP +
    SERVICES_ROWS * SERVICES_ROW_HEIGHT +
    (SERVICES_ROWS - 1) * (SERVICES_ROW_GAP + SERVICES_DIVIDER_HEIGHT);
  const servicesCardH = SERVICES_CARD_PAD * 2 + servicesContentH;

  const totalH = statsTotalH + STATS_TO_SERVICES_GAP + servicesCardH;

  const row2Y = STAT_CARD_HEIGHT + STAT_ROWS_GAP;
  const servicesY = statsTotalH + STATS_TO_SERVICES_GAP;

  return (
    <View>
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* Stat cards row 1 */}
        <Rect
          x={0}
          y={0}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={cardW}
          height={STAT_CARD_HEIGHT}
        />
        <Rect
          x={cardW + STAT_CARD_GAP}
          y={0}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={cardW}
          height={STAT_CARD_HEIGHT}
        />

        {/* Stat cards row 2 */}
        <Rect
          x={0}
          y={row2Y}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={cardW}
          height={STAT_CARD_HEIGHT}
        />
        <Rect
          x={cardW + STAT_CARD_GAP}
          y={row2Y}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={cardW}
          height={STAT_CARD_HEIGHT}
        />

        {/* Services card outline */}
        <Rect
          x={0}
          y={servicesY}
          rx={CARD_RADIUS}
          ry={CARD_RADIUS}
          width={w}
          height={servicesCardH}
        />

        {/* Services title */}
        <Rect
          x={SERVICES_CARD_PAD}
          y={servicesY + SERVICES_CARD_PAD}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={160}
          height={SERVICES_TITLE_HEIGHT}
        />

        {/* Services rows */}
        {Array.from({ length: SERVICES_ROWS }).map((_, i) => {
          const rowY =
            servicesY +
            SERVICES_CARD_PAD +
            SERVICES_TITLE_HEIGHT +
            SERVICES_ROW_GAP +
            SERVICES_DIVIDER_HEIGHT +
            SERVICES_ROW_GAP +
            i * (SERVICES_ROW_HEIGHT + SERVICES_ROW_GAP + SERVICES_DIVIDER_HEIGHT);
          const nameW = 120 + (i % 2) * 30;
          const valueW = 60 + (i % 3) * 20;

          return (
            <React.Fragment key={i}>
              <Rect
                x={SERVICES_CARD_PAD}
                y={rowY}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={nameW}
                height={SERVICES_ROW_HEIGHT}
              />
              <Rect
                x={w - SERVICES_CARD_PAD - valueW}
                y={rowY}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={valueW}
                height={SERVICES_ROW_HEIGHT}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </View>
  );
};

export default ClientsStatisticsSkeleton;
