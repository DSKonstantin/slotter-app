import React from "react";
import { useWindowDimensions, View } from "react-native";
import ContentLoader, { Circle, Rect } from "react-content-loader/native";
import { colors } from "@/src/styles/colors";
import { SCREEN_PADDING } from "@/src/constants/layout";

const SPEED = 1.2;
const BG = colors.neutral[100];
const FG = "#F5F5FA";

const CARD_PADDING = 16;
const CAPTION_LINE = 18;
const NUMBER_LINE = 22;
const TEXT_GAP = 8;
const BLOCK_GAP = 16;
const BUTTON_MD = 50;
const BUTTON_SM = 40;
const BAR_RADIUS = 6;

const CARD_HEIGHT = CARD_PADDING * 2 + CAPTION_LINE + TEXT_GAP + NUMBER_LINE;
const STATUS_Y = CARD_HEIGHT + BLOCK_GAP;
const HINT_Y = STATUS_Y + CAPTION_LINE + BLOCK_GAP;
const RESEND_Y = HINT_Y + CAPTION_LINE + TEXT_GAP;

export const CALL_METHOD_SKELETON_HEIGHT = RESEND_Y + BUTTON_MD;

const centeredX = (barWidth: number, areaWidth: number) =>
  (areaWidth - barWidth) / 2;

export const CallMethodSkeleton = () => {
  const { width } = useWindowDimensions();
  const w = width - SCREEN_PADDING * 2;

  const barY = (lineY: number, lineHeight: number, barHeight: number) =>
    lineY + (lineHeight - barHeight) / 2;

  return (
    <View
      testID="call-method-skeleton"
      className="mt-8"
      style={{ height: CALL_METHOD_SKELETON_HEIGHT }}
    >
      <View
        className="absolute left-0 right-0 bg-background-surface rounded-base"
        style={{ top: 0, height: CARD_HEIGHT }}
      />
      <View
        className="absolute left-0 right-0 bg-background-surface rounded-medium"
        style={{ top: RESEND_Y, height: BUTTON_MD }}
      />

      <ContentLoader
        speed={SPEED}
        width={w}
        height={CALL_METHOD_SKELETON_HEIGHT}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        <Rect
          x={CARD_PADDING}
          y={barY(CARD_PADDING, CAPTION_LINE, 10)}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          width={150}
          height={10}
        />
        <Rect
          x={CARD_PADDING}
          y={barY(CARD_PADDING + CAPTION_LINE + TEXT_GAP, NUMBER_LINE, 18)}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          width={176}
          height={18}
        />
        <Rect
          x={w - CARD_PADDING - 104}
          y={(CARD_HEIGHT - BUTTON_SM) / 2}
          rx={BUTTON_SM / 2}
          ry={BUTTON_SM / 2}
          width={104}
          height={BUTTON_SM}
        />

        <Circle cx={4 + 3} cy={STATUS_Y + CAPTION_LINE / 2} r={3} />
        <Circle cx={4 + 3 + 10} cy={STATUS_Y + CAPTION_LINE / 2} r={3} />
        <Circle cx={4 + 3 + 20} cy={STATUS_Y + CAPTION_LINE / 2} r={3} />
        <Rect
          x={4 + 26 + 8}
          y={barY(STATUS_Y, CAPTION_LINE, 10)}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          width={104}
          height={10}
        />
        <Rect
          x={w - 4 - 38}
          y={barY(STATUS_Y, CAPTION_LINE, 10)}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          width={38}
          height={10}
        />

        <Rect
          x={centeredX(176, w)}
          y={barY(HINT_Y, CAPTION_LINE, 10)}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          width={176}
          height={10}
        />
        <Rect
          x={centeredX(132, w)}
          y={barY(RESEND_Y, BUTTON_MD, 12)}
          rx={BAR_RADIUS}
          ry={BAR_RADIUS}
          width={132}
          height={12}
        />
      </ContentLoader>
    </View>
  );
};
