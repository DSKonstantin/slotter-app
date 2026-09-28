import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { StSvg, Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { colors } from "@/src/styles/colors";
import { MOCK_WORKING_DAY } from "./constants";

const ScheduleHint = () => (
  <View className="flex-row gap-1">
    <StSvg name="Info_alt" size={16} color={colors.neutral[500]} />
    <Typography
      weight="regular"
      className="flex-1 text-caption text-neutral-500"
    >
      По графику{" "}
      <Typography
        weight="regular"
        className="text-caption text-neutral-900 underline"
      >
        (Шаблон недели)
      </Typography>
      : {MOCK_WORKING_DAY.start}–{MOCK_WORKING_DAY.end}. Сетка и границы дня
      всегда берутся из{" "}
      <Typography
        weight="regular"
        className="text-caption text-neutral-900 underline"
      >
        графика
      </Typography>{" "}
      — отдельно тут не настраиваются
    </Typography>
  </View>
);

export default ScheduleHint;
