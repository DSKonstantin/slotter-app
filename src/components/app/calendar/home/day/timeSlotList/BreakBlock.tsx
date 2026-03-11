import React from "react";
import { View } from "react-native";
import { Badge, Typography } from "@/src/components/ui";
import { parseTime, formatTime } from "./utils";
import type { WorkingDayBreak } from "@/src/store/redux/services/api-types";

type Props = {
  breakItem: WorkingDayBreak;
};

const BreakBlock: React.FC<Props> = ({ breakItem }) => {
  const timeLabel = `${formatTime(parseTime(breakItem.start_at))} - ${formatTime(parseTime(breakItem.end_at))}`;

  return (
    <View className="flex-1 rounded-base bg-background-surface overflow-hidden px-4 py-4 flex-row justify-between mb-1">
      <Typography className="text-body text-neutral-900" numberOfLines={1}>
        {timeLabel}
      </Typography>

      <Badge size="sm" title={"Перерыв"} variant="tertiary" />
    </View>
  );
};

export default BreakBlock;
