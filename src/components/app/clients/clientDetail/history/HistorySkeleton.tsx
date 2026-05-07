import React from "react";
import { View, useWindowDimensions } from "react-native";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { colors } from "@/src/styles/colors";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_RADIUS = 20;
const TEXT_RADIUS = 8;
const CHIP_HEIGHT = 40;
const CHIP_WIDTH = 132;
const CHIP_AVATAR = 24;
const SECTION_GAP = 24;
const ROW_GAP = 12;
const COLUMN_GAP = 12;

type Props = {
  filterActive: boolean;
};

const HistorySkeleton = ({ filterActive }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;
  const serviceCardW = (w - COLUMN_GAP) / 2;

  const chipY = 0;
  const contentY = CHIP_HEIGHT + 20;

  const financeHeight = 128 + 20 + 190 + 24 + 18 + 8 + 88 + 12 + 88;
  const appointmentsHeight = 14 + 16 + 118 + 24 + 14 + 16 + 118;
  const totalH = contentY + (filterActive ? appointmentsHeight : financeHeight);

  return (
    <View>
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect
          x={(w - CHIP_WIDTH) / 2}
          y={chipY}
          rx={CHIP_HEIGHT / 2}
          ry={CHIP_HEIGHT / 2}
          width={CHIP_WIDTH}
          height={CHIP_HEIGHT}
        />
        <Circle
          cx={(w - CHIP_WIDTH) / 2 + 12 + CHIP_AVATAR / 2}
          cy={chipY + CHIP_HEIGHT / 2}
          r={CHIP_AVATAR / 2}
        />
        <Rect
          x={(w - CHIP_WIDTH) / 2 + 12 + CHIP_AVATAR + 10}
          y={chipY + 13}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={72}
          height={14}
        />

        {filterActive ? (
          <>
            <Rect
              x={0}
              y={contentY}
              rx={TEXT_RADIUS}
              ry={TEXT_RADIUS}
              width={110}
              height={14}
            />

            <Rect
              x={0}
              y={contentY + 30}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={serviceCardW}
              height={118}
            />
            <Rect
              x={serviceCardW + COLUMN_GAP}
              y={contentY + 30}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={serviceCardW}
              height={118}
            />

            <Rect
              x={0}
              y={contentY + 30 + 118 + SECTION_GAP}
              rx={TEXT_RADIUS}
              ry={TEXT_RADIUS}
              width={148}
              height={14}
            />

            <Rect
              x={0}
              y={contentY + 30 + 118 + SECTION_GAP + 30}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={serviceCardW}
              height={118}
            />
            <Rect
              x={serviceCardW + COLUMN_GAP}
              y={contentY + 30 + 118 + SECTION_GAP + 30}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={serviceCardW}
              height={118}
            />
          </>
        ) : (
          <>
            <Rect
              x={0}
              y={contentY}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={w}
              height={128}
            />

            <Rect
              x={0}
              y={contentY + 128 + 20}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={w}
              height={190}
            />

            <Rect
              x={0}
              y={contentY + 128 + 20 + 190 + SECTION_GAP}
              rx={TEXT_RADIUS}
              ry={TEXT_RADIUS}
              width={108}
              height={18}
            />

            <Rect
              x={0}
              y={contentY + 128 + 20 + 190 + SECTION_GAP + 26}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={w}
              height={88}
            />
            <Rect
              x={0}
              y={contentY + 128 + 20 + 190 + SECTION_GAP + 26 + 88 + ROW_GAP}
              rx={CARD_RADIUS}
              ry={CARD_RADIUS}
              width={w}
              height={88}
            />
          </>
        )}
      </ContentLoader>
    </View>
  );
};

export default HistorySkeleton;
