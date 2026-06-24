import React, { memo } from "react";
import { View } from "react-native";
import { Svg, Line } from "react-native-svg";
import type { SegmentContent } from "./segmentBuilder";
import { getSlotMinHeight, slotOccupiesTime } from "./segmentBuilder";
import { MINUTE_HEIGHT, SLOT_GAP } from "./constants";
import { colors } from "@/src/styles/colors";

type Props = {
  segStart: number;
  segEnd: number;
  content: SegmentContent;
  isLast: boolean;
};

const SegmentGridMarks = memo(function SegmentGridMarks({
  segStart,
  segEnd,
  content,
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

  const markTop = (t: number) =>
    ((t - segStart) / (segEnd - segStart)) * gridHeight;
  // cancelledOffset shifts marks into the free-slot pressable area, which has
  // exactly gridHeight reserved for it. When an occupying slot is present
  // (showFreeSlotBlock=false) segHeight=gridHeight so adding cancelledOffset
  // would push marks past the segment boundary.
  const hasFreeSlotBlock =
    content.kind === "slots" && content.showFreeSlotBlock;
  const markTopFreeSlot = (t: number) =>
    hasFreeSlotBlock ? cancelledOffset + markTop(t) : markTop(t);

  const hourMarks: number[] = [];
  for (let t = Math.ceil(segStart / 60) * 60; t < segEnd; t += 60)
    hourMarks.push(t);
  if (isLast && segEnd % 60 === 0) hourMarks.push(segEnd);

  const halfHourMarks: number[] = [];
  for (let t = Math.floor((segStart + 30) / 60) * 60 + 30; t <= segEnd; t += 60)
    halfHourMarks.push(t);

  return (
    <>
      {hourMarks.map((t) => (
        <View
          key={`h-${t}`}
          pointerEvents="none"
          className="absolute left-[50px] right-0 bg-neutral-200"
          style={{ top: markTopFreeSlot(t), height: 1 }}
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
