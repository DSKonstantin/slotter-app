import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import { Badge, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { parseTime, formatTime } from "./utils";
import type { WorkingDayBreak } from "@/src/store/redux/services/api-types";

type Props = {
  breakItem: WorkingDayBreak;
  workingDayId?: number;
};

const BreakBlock: React.FC<Props> = ({ breakItem, workingDayId }) => {
  const router = useRouter();
  const startMin = parseTime(breakItem.start_at);
  const endMin = parseTime(breakItem.end_at);
  const isShort = endMin - startMin <= 30;
  const timeLabel = `${formatTime(startMin)} - ${formatTime(endMin)}`;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!workingDayId}
      className={`flex-1 rounded-base bg-background-surface overflow-hidden px-4 flex-row items-center justify-between`}
      onPress={() =>
        workingDayId &&
        router.push(Routers.app.calendar.daySchedule(workingDayId))
      }
    >
      <Typography
        className={`text-body text-neutral-900`}
        numberOfLines={1}
      >
        {timeLabel}
      </Typography>

      <View className={`${isShort ? "py-1" : "py-4"}`}>
        <Badge size="sm" title="Перерыв" variant="neutral" />
      </View>
    </TouchableOpacity>
  );
};

export default BreakBlock;
