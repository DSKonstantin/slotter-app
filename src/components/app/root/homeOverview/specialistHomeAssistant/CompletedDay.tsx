import React, { memo } from "react";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  firstName: string;
};

function CompletedDayComponent({ firstName }: Props) {
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-1">
        <StSvg name="Check_round_fill" size={20} color={colors.neutral[900]} />
        <Typography weight="semibold" className="text-lg text-neutral-900">
          День завершён
        </Typography>
      </View>
      <Typography weight="semibold" className="text-lg text-neutral-900">
        {firstName}, на сегодня всё. Хорошего дня!
      </Typography>
    </View>
  );
}

export default memo(CompletedDayComponent);
