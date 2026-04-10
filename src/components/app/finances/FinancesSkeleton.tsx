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

const FinancesSkeleton = ({ topInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - H_PAD * 2;

  // Block positions
  const incomeCardH = 128;
  const periodCardH = 70;
  const expensesH = 220;
  const statCardsH = 88;

  const y0 = 0; // IncomeCard
  const y1 = y0 + incomeCardH + GAP; // Period card
  const y2 = y1 + periodCardH + GAP; // Expenses block
  const y3 = y2 + expensesH + GAP; // Stat cards
  const totalH = y3 + statCardsH;

  const halfW = (w - 10) / 2;

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: H_PAD, paddingTop: topInset + GAP }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* IncomeCard */}
        <Rect x={0} y={y0} rx={RADIUS} ry={RADIUS} width={w} height={incomeCardH} />

        {/* Period card */}
        <Rect x={0} y={y1} rx={RADIUS} ry={RADIUS} width={w} height={periodCardH} />

        {/* Expenses block */}
        <Rect x={0} y={y2} rx={RADIUS} ry={RADIUS} width={w} height={expensesH} />

        {/* Stat cards row */}
        <Rect x={0} y={y3} rx={RADIUS} ry={RADIUS} width={halfW} height={statCardsH} />
        <Rect x={halfW + 10} y={y3} rx={RADIUS} ry={RADIUS} width={halfW} height={statCardsH} />
      </ContentLoader>
    </ScrollView>
  );
};

export default FinancesSkeleton;
