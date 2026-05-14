import React from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const GAP = 16;
const BLOCK_GAP = 24;
const INPUT_HEIGHT = 56;
const LABEL_HEIGHT = 16;
const DIVIDER_HEIGHT = 1;
const BUTTON_HEIGHT = 44;
const RADIUS = 16;

const BG = colors.neutral[100];
const FG = "#F5F5FA";

type Props = {
  topInset?: number;
};

const LinksSkeleton = ({ topInset = 0 }: Props) => {
  const { width } = useWindowDimensions();

  const w = width - SCREEN_PADDING * 2;

  const blockHeight =
    LABEL_HEIGHT +
    GAP +
    INPUT_HEIGHT +
    GAP +
    INPUT_HEIGHT +
    GAP +
    DIVIDER_HEIGHT;

  const y0 = 0;

  const y1 = y0 + blockHeight + BLOCK_GAP;

  const y2 = y1 + blockHeight + BLOCK_GAP;

  const addButtonY = y2 + blockHeight + BLOCK_GAP;

  const totalHeight = addButtonY + BUTTON_HEIGHT;

  return (
    <ScrollView
      scrollEnabled={false}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: SCREEN_PADDING,
        paddingTop: topInset + GAP,
        paddingBottom: 24,
      }}
    >
      <ContentLoader
        speed={1.2}
        width={w}
        height={totalHeight}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {/* Block 1 */}
        <Rect x={0} y={y0} rx={8} ry={8} width={120} height={LABEL_HEIGHT} />

        <Rect
          x={0}
          y={y0 + LABEL_HEIGHT + GAP}
          rx={RADIUS}
          ry={RADIUS}
          width={w}
          height={INPUT_HEIGHT}
        />

        <Rect
          x={0}
          y={y0 + LABEL_HEIGHT + GAP + INPUT_HEIGHT + GAP}
          rx={RADIUS}
          ry={RADIUS}
          width={w}
          height={INPUT_HEIGHT}
        />

        <Rect
          x={0}
          y={y0 + blockHeight - DIVIDER_HEIGHT}
          rx={1}
          ry={1}
          width={w}
          height={DIVIDER_HEIGHT}
        />

        {/* Block 2 */}
        <Rect x={0} y={y1} rx={8} ry={8} width={120} height={LABEL_HEIGHT} />

        <Rect
          x={0}
          y={y1 + LABEL_HEIGHT + GAP}
          rx={RADIUS}
          ry={RADIUS}
          width={w}
          height={INPUT_HEIGHT}
        />

        <Rect
          x={0}
          y={y1 + LABEL_HEIGHT + GAP + INPUT_HEIGHT + GAP}
          rx={RADIUS}
          ry={RADIUS}
          width={w}
          height={INPUT_HEIGHT}
        />

        <Rect
          x={0}
          y={y1 + blockHeight - DIVIDER_HEIGHT}
          rx={1}
          ry={1}
          width={w}
          height={DIVIDER_HEIGHT}
        />
      </ContentLoader>
    </ScrollView>
  );
};

export default LinksSkeleton;
