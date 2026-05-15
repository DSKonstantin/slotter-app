import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_RADIUS = 16;
const TEXT_RADIUS = 8;
const CARD_PADDING = 16;
const AVATAR = 44;
const ROW_H = 76;
const ROW_GAP = 8;
const HEADER_H = 14;
const HEADER_GAP = 8;
const SECTION_GAP = 16;

type RowConfig = { titleW: number; bodyW: number };

const ROWS: RowConfig[] = [
  { titleW: 160, bodyW: 100 },
  { titleW: 140, bodyW: 80 },
  { titleW: 180, bodyW: 120 },
  { titleW: 150, bodyW: 90 },
  { titleW: 130, bodyW: 110 },
];

type Props = { topInset?: number };

const HistorySkeleton = ({ topInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;

  const avatarCx = CARD_PADDING + AVATAR / 2;
  const textX = CARD_PADDING + AVATAR + 12;

  // Section 1: header + 3 rows
  const h1 = HEADER_H;
  const r1y = h1 + HEADER_GAP;
  const r2y = r1y + ROW_H + ROW_GAP;
  const r3y = r2y + ROW_H + ROW_GAP;

  // Section 2: header + 2 rows
  const h2 = r3y + ROW_H + SECTION_GAP;
  const r4y = h2 + HEADER_H + HEADER_GAP;
  const r5y = r4y + ROW_H + ROW_GAP;

  const totalH = r5y + ROW_H;

  const rowY = [r1y, r2y, r3y, r4y, r5y];

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingTop: topInset,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* Section 1 header */}
        <Rect
          x={0}
          y={0}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={60}
          height={HEADER_H}
        />

        {/* Section 2 header */}
        <Rect
          x={0}
          y={h2}
          rx={TEXT_RADIUS}
          ry={TEXT_RADIUS}
          width={50}
          height={HEADER_H}
        />

        {ROWS.map(({ titleW, bodyW }, i) => {
          const y = rowY[i];
          const cy = y + ROW_H / 2;

          return (
            <React.Fragment key={i}>
              {/* Card background */}
              <Rect
                x={0}
                y={y}
                rx={CARD_RADIUS}
                ry={CARD_RADIUS}
                width={w}
                height={ROW_H}
              />
              {/* Avatar */}
              <Circle cx={avatarCx} cy={cy} r={AVATAR / 2} />
              {/* Title */}
              <Rect
                x={textX}
                y={cy - 18}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={titleW}
                height={14}
              />
              {/* Time (top right) */}
              <Rect
                x={w - 30}
                y={cy - 18}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={28}
                height={10}
              />
              {/* Body */}
              <Rect
                x={textX}
                y={cy + 4}
                rx={TEXT_RADIUS}
                ry={TEXT_RADIUS}
                width={bodyW}
                height={12}
              />
            </React.Fragment>
          );
        })}
      </ContentLoader>
    </ScrollView>
  );
};

export default HistorySkeleton;
