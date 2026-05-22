import React from "react";
import { Platform, ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const GAP = 16;
const RADIUS = 12;
const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

type Props = { topInset?: number; bottomInset?: number };

const SubscriptionSkeleton = ({ topInset = 0, bottomInset = 0 }: Props) => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;

  const statusCardH = 88;
  const dividerH = 1;
  const labelH = 20;
  const planCardH = 152;

  const y0 = 0;
  const y1 = y0 + statusCardH + GAP;
  const y2 = y1 + dividerH + GAP;
  const y3 = y2 + labelH + GAP;
  const y4 = y3 + planCardH + GAP;
  const totalH = y4 + planCardH;

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentInset={Platform.OS === "ios" ? { top: topInset } : undefined}
      contentOffset={
        Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
      }
      contentContainerStyle={{
        paddingTop: Platform.OS === "ios" ? 0 : topInset,
        paddingBottom: bottomInset + 8,
        paddingHorizontal: SCREEN_PADDING,
      }}
    >
      <ContentLoader
        speed={SPEED}
        width={w}
        height={totalH}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* Status card */}
        <Rect x={0} y={y0} rx={RADIUS} ry={RADIUS} width={w} height={statusCardH} />

        {/* Divider */}
        <Rect x={0} y={y1} rx={1} ry={1} width={w} height={dividerH} />

        {/* "Выберите тариф" label */}
        <Rect x={0} y={y2} rx={6} ry={6} width={140} height={labelH} />

        {/* Plan card 1 */}
        <Rect x={0} y={y3} rx={RADIUS} ry={RADIUS} width={w} height={planCardH} />

        {/* Plan card 2 */}
        <Rect x={0} y={y4} rx={RADIUS} ry={RADIUS} width={w} height={planCardH} />
      </ContentLoader>
    </ScrollView>
  );
};

export default SubscriptionSkeleton;
