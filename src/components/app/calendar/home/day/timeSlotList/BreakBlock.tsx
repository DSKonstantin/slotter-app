import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { router } from "expo-router";
import { Badge, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { parseTime, formatTime } from "./utils";
import EditBreakModal from "./EditBreakModal";
import type { WorkingDayBreak } from "@/src/store/redux/services/api-types";

type Props = {
  breakItem: WorkingDayBreak;
  workingDayId?: number;
};

const BreakBlock: React.FC<Props> = ({ breakItem, workingDayId }) => {
  const [editVisible, setEditVisible] = useState(false);
  const kind = breakItem.kind ?? "main";
  const startMin = parseTime(breakItem.start_at);
  const endMin = parseTime(breakItem.end_at);
  const isShort = endMin - startMin <= 30;
  const timeLabel = `${formatTime(startMin)} - ${formatTime(endMin)}`;

  // "main" breaks are part of the recurring day schedule — edited together
  // with the rest of it (overlap checks against other breaks, the 3-break
  // cap) in the day-schedule form, not standalone here. EditBreakModal has
  // no visibility into a day's other breaks, so it can't safely replace
  // that for this kind.
  if (kind === "main") {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!workingDayId}
        className="flex-1 rounded-base bg-background-surface overflow-hidden px-4 flex-row items-center justify-between"
        onPress={() =>
          workingDayId &&
          router.push(Routers.app.daySchedule.edit(workingDayId))
        }
      >
        <Typography className="text-body text-neutral-900" numberOfLines={1}>
          {timeLabel}
        </Typography>

        <View className={isShort ? "py-1" : "py-4"}>
          <Badge
            size="sm"
            title={breakItem.name || "Перерыв"}
            variant="neutral"
          />
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <>
      <TouchableOpacity
        activeOpacity={0.7}
        disabled={!workingDayId}
        className="flex-1 rounded-base border border-neutral-200 bg-transparent overflow-hidden px-4 flex-row items-center gap-2"
        onPress={() => workingDayId && setEditVisible(true)}
      >
        <Typography
          weight="semibold"
          className="text-body text-neutral-900 flex-1"
          numberOfLines={1}
        >
          {breakItem.name || "Занято"}
        </Typography>

        <Typography className="text-body text-neutral-500" numberOfLines={1}>
          {timeLabel}
        </Typography>
      </TouchableOpacity>

      <EditBreakModal
        visible={editVisible}
        breakItem={breakItem}
        workingDayId={workingDayId}
        onClose={() => setEditVisible(false)}
      />
    </>
  );
};

export default BreakBlock;
