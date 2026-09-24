import React, { memo, useMemo } from "react";
import { Typography } from "@/src/components/ui";
import { formatTime, markTop as markTopAt } from "./utils";
import { getHourMarks } from "./gridMarks";

type TimeLabelsProps = {
  segStart: number;
  segEnd: number;
  gridHeight: number;
  effectiveStart: number;
  effectiveEnd: number;
  isFirst?: boolean;
  isLast?: boolean;
};

const TimeLabels = ({
  segStart,
  segEnd,
  gridHeight,
  effectiveStart,
  effectiveEnd,
  isFirst,
  isLast,
}: TimeLabelsProps) => {
  const hourMinutes = useMemo(
    () =>
      getHourMarks(
        segStart,
        segEnd,
        effectiveStart,
        effectiveEnd,
        isFirst,
        isLast,
      ),
    [segStart, segEnd, effectiveStart, effectiveEnd, isFirst, isLast],
  );

  const markTop = (t: number) => markTopAt(t, segStart, segEnd, gridHeight);

  return (
    <>
      {hourMinutes.map((hMin) => (
        <Typography
          key={hMin}
          className="text-caption text-neutral-500 absolute"
          style={{
            top: markTop(hMin),
            transform: [{ translateY: -9 }],
          }}
        >
          {formatTime(hMin)}
        </Typography>
      ))}
    </>
  );
};

export default memo(TimeLabels);
