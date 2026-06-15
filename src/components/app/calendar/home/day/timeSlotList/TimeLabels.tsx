import React, { memo, useMemo } from "react";
import { Typography } from "@/src/components/ui";
import { formatTime } from "./utils";

type TimeLabelsProps = {
  segStart: number;
  segEnd: number;
  gridHeight: number;
  isLast?: boolean;
};

const TimeLabels = ({
  segStart,
  segEnd,
  gridHeight,
  isLast,
}: TimeLabelsProps) => {
  const hourMinutes = useMemo(() => {
    const firstHour = Math.ceil(segStart / 60);
    const lastHour = Math.floor(segEnd / 60);
    return Array.from(
      { length: lastHour - firstHour + 1 },
      (_, i) => (firstHour + i) * 60,
    ).filter(
      (hMin) =>
        hMin >= segStart &&
        (hMin < segEnd || (isLast === true && hMin === segEnd)),
    );
  }, [segStart, segEnd, isLast]);

  const markTop = (t: number) =>
    ((t - segStart) / (segEnd - segStart)) * gridHeight;

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
