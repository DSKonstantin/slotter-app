import React, { memo } from "react";
import { View } from "react-native";
import { Svg, Line } from "react-native-svg";
import type { SegmentContent } from "./segmentBuilder";
import { getSlotMinHeight, slotOccupiesTime } from "./segmentBuilder";
import { MINUTE_HEIGHT, SLOT_GAP } from "./constants";
import { getHalfHourMarks, getHourMarks } from "./gridMarks";
import { markTop as markTopAt } from "./utils";
import { colors } from "@/src/styles/colors";

type Props = {
  segStart: number;
  segEnd: number;
  content: SegmentContent;
  effectiveStart: number;
  effectiveEnd: number;
  isFirst: boolean;
  isLast: boolean;
};

const SegmentGridMarks = memo(function SegmentGridMarks({
  segStart,
  segEnd,
  content,
  effectiveStart,
  effectiveEnd,
  isFirst,
  isLast,
}: Props) {
  const gridHeight = (segEnd - segStart) * MINUTE_HEIGHT;

  const nonOccupyingSlots =
    content.kind === "slots"
      ? content.slots.filter((s) => !slotOccupiesTime(s))
      : [];
  const cancelledOffset =
    content.kind === "slots"
      ? SLOT_GAP +
        nonOccupyingSlots.reduce((h, s) => h + getSlotMinHeight(s), 0) +
        SLOT_GAP * nonOccupyingSlots.length
      : 0;

  const markTop = (t: number) => markTopAt(t, segStart, segEnd, gridHeight);
  const hasFreeSlotBlock =
    content.kind === "slots" && content.showFreeSlotBlock;
  const markTopFreeSlot = (t: number) =>
    hasFreeSlotBlock ? cancelledOffset + markTop(t) : markTop(t);

  const hourMarks = getHourMarks(
    segStart,
    segEnd,
    effectiveStart,
    effectiveEnd,
    isFirst,
    isLast,
  );
  const halfHourMarks = getHalfHourMarks(
    segStart,
    segEnd,
    hourMarks,
    effectiveStart,
    effectiveEnd,
  );

  return (
    <>
      {hourMarks.map((t) => (
        <View
          key={`h-${t}`}
          pointerEvents="none"
          className="absolute left-[50px] right-0 bg-neutral-200"
          style={{ top: markTop(t), height: 1 }}
        />
      ))}
      {halfHourMarks.map((t) => (
        <View
          key={`hh-${t}`}
          pointerEvents="none"
          className="absolute left-[50px] right-0"
          style={{ top: markTopFreeSlot(t) }}
        >
          <Svg width="100%" height={2}>
            <Line
              x1="0"
              y1="1"
              x2="100%"
              y2="1"
              stroke={colors.neutral[200]}
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          </Svg>
        </View>
      ))}
    </>
  );
});

export default SegmentGridMarks;
