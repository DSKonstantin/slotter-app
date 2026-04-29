import React, { memo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { formatApiDate } from "@/src/utils/date/formatDate";

function SetupScheduleVariantComponent() {
  return (
    <View className="gap-3">
      <View className="flex-row items-center gap-2">
        <StSvg name="Time_light" size={20} color={colors.neutral[900]} />
        <Typography weight="semibold" className="text-xl">
          Настройте рабочий день
        </Typography>
      </View>

      <Typography className="text-body text-neutral-500">
        Без созданного рабочего дня клиенты не смогут записаться
      </Typography>

      <Button
        title="Добавить запись"
        rightIcon={
          <StSvg name="Add_round_fill" size={24} color={colors.neutral[0]} />
        }
        onPress={() =>
          router.push(
            Routers.app.calendar.dayScheduleCreate(formatApiDate(new Date())),
          )
        }
      />
    </View>
  );
}

export default memo(SetupScheduleVariantComponent);
