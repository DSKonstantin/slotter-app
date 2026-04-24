import React from "react";
import { Typography } from "@/src/components/ui";
import { MINUTE_HEIGHT } from "./constants";
import { formatTime } from "./utils";

type TimeLabelsProps = {
  segStart: number;
  segEnd: number;
};

const TimeLabels = ({ segStart, segEnd }: TimeLabelsProps) => {
  const firstHour = Math.ceil(segStart / 60);
  const lastHour = Math.floor(segEnd / 60);

  return (
    <>
      {Array.from(
        { length: lastHour - firstHour + 1 },
        (_, i) => (firstHour + i) * 60,
      )
        .filter((hMin) => hMin >= segStart && hMin < segEnd)
        .map((hMin) => (
          <Typography
            key={hMin}
            className="text-caption text-gray-500 absolute"
            style={{
              top: (hMin - segStart) * MINUTE_HEIGHT,
            }}
          >
            {formatTime(hMin)}
          </Typography>
        ))}
    </>
  );
};

export default TimeLabels;
