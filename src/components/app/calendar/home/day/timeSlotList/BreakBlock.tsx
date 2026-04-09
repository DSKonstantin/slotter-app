import React from "react";
import { TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Badge, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { parseTime, formatTime } from "./utils";
import type { WorkingDayBreak } from "@/src/store/redux/services/api-types";

type Props = {
  breakItem: WorkingDayBreak;
};

const BreakBlock: React.FC<Props> = ({ breakItem }) => {
  const router = useRouter();
  const timeLabel = `${formatTime(parseTime(breakItem.start_at))} - ${formatTime(parseTime(breakItem.end_at))}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-1 rounded-base bg-background-surface overflow-hidden px-4 py-4 flex-row justify-between mb-1"
      onPress={() =>
        router.push(Routers.app.calendar.daySchedule(breakItem.id))
      }
    >
      <Typography className="text-body text-neutral-900" numberOfLines={1}>
        {timeLabel}
      </Typography>

      <Badge size="sm" title={"Перерыв"} variant="neutral" />
    </TouchableOpacity>
  );
};

export default BreakBlock;
