import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";

const H_PAD = 20;
const GAP = 20;
const RADIUS = 12;
const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

type Props = { topInset?: number };

const FinancesIncomeSkeleton = ({ topInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - H_PAD * 2;

  const chartH = 220;
  const totalCardH = 70;
  const segmentH = 44;
  const itemH = 64;
  const itemCount = 3;
  const itemsH = itemH * itemCount + (itemCount - 1) * 8;

  const y0 = 0;
  const y1 = y0 + chartH + GAP;
  const y2 = y1 + totalCardH + GAP;
  const y3 = y2 + segmentH + GAP;
  const totalH = y3 + itemsH;

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: H_PAD,
        paddingTop: topInset + GAP,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* Chart card */}
        <Rect x={0} y={y0} rx={RADIUS} ry={RADIUS} width={w} height={chartH} />

        {/* Итого card */}
        <Rect
          x={0}
          y={y1}
          rx={RADIUS}
          ry={RADIUS}
          width={w}
          height={totalCardH}
        />

        {/* SegmentedControl */}
        <Rect
          x={0}
          y={y2}
          rx={RADIUS}
          ry={RADIUS}
          width={w}
          height={segmentH}
        />

        {/* Breakdown items */}
        {Array.from({ length: itemCount }).map((_, i) => (
          <Rect
            key={i}
            x={0}
            y={y3 + i * (itemH + 8)}
            rx={RADIUS}
            ry={RADIUS}
            width={w}
            height={itemH}
          />
        ))}
      </ContentLoader>
    </ScrollView>
  );
};

export default FinancesIncomeSkeleton;
