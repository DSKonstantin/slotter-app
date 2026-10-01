import React, { memo } from "react";
import { View } from "react-native";
import { HatchPattern, Typography } from "@/src/components/ui";
import { formatTime } from "./utils";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { LEFT_COL, SHORT_SLOT_MIN_HEIGHT } from "./constants";

type OnlineUnavailableBlockProps = {
  start: number;
  end: number;
  top: number;
  height: number;
};

const OnlineUnavailableBlock = ({
  start,
  end,
  top,
  height,
}: OnlineUnavailableBlockProps) => (
  <View
    pointerEvents="none"
    className="absolute overflow-hidden rounded-base border border-neutral-200 px-4 flex-row items-center justify-between gap-2"
    style={{
      top,
      height,
      left: SCREEN_PADDING + LEFT_COL + 10,
      right: SCREEN_PADDING,
    }}
  >
    <HatchPattern />
    {height >= SHORT_SLOT_MIN_HEIGHT && (
      <>
        <Typography
          weight="semibold"
          numberOfLines={1}
          className="flex-shrink text-body text-neutral-900"
        >
          Не доступно к онлайн-записи
        </Typography>
        <Typography className="text-body text-neutral-400">
          {formatTime(start)} - {formatTime(end)}
        </Typography>
      </>
    )}
  </View>
);

export default memo(OnlineUnavailableBlock);
