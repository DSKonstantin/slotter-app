import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { StSvg, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import { formatMinutes } from "@/src/utils/date/formatTime";
import type { TimeRange } from "@/src/utils/bookingFixedTime";

type ScheduleHintProps = {
  range: TimeRange;
};

const ScheduleHint = ({ range }: ScheduleHintProps) => (
  <View className="flex-row gap-1">
    <StSvg name="Info_alt" size={16} color={colors.neutral[500]} />
    <Typography
      weight="regular"
      className="flex-1 text-caption text-neutral-500"
    >
      По графику (
      <Typography
        weight="regular"
        className="text-caption text-neutral-900 underline"
        onPress={() => router.push(Routers.app.account.bookingSchedule(true))}
      >
        Шаблон недели
      </Typography>
      ): {formatMinutes(range.start)}–{formatMinutes(range.end)}.{"\n"}
      Сетка и границы дня берутся из{" "}
      <Typography
        weight="regular"
        className="text-caption text-neutral-900 underline"
        onPress={() => router.push(Routers.app.account.bookingSchedule())}
      >
        графика
      </Typography>
      , здесь они не настраиваются.
    </Typography>
  </View>
);

export default ScheduleHint;
