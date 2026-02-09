import React from "react";
import { View } from "react-native";
import { Avatar, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const SpecialistHomeAssistant = () => {
  return (
    <View className="flex-1">
      <View className="flex-row gap-1 items-center">
        <Typography weight="semibold" className="text-neutral-700 text-2xl">
          Доброе утро,
        </Typography>
        <Avatar size="xs" />
        <Typography weight="semibold" className="text-neutral-0 text-2xl">
          Ирина
        </Typography>
      </View>

      <View className="flex-row gap-1 items-center">
        <Typography weight="semibold" className="text-neutral-700 text-2xl">
          У тебя сегодня
        </Typography>
        <StSvg name="Date_range_fill" size={24} color={colors.neutral[0]} />
        <Typography weight="semibold" className="text-neutral-0 text-2xl">
          4 записи
        </Typography>
      </View>

      <View className="flex-row gap-1 items-center">
        <Typography weight="semibold" className="text-neutral-700 text-2xl">
          Ближайшая начнется в
        </Typography>
        <Typography weight="semibold" className="text-neutral-0 text-2xl">
          14:00
        </Typography>
      </View>

      <View className="flex-row gap-1 items-center">
        <Typography weight="semibold" className="text-neutral-700 text-2xl">
          Доход за день
        </Typography>
        <StSvg name="Wallet_fill" size={24} color={colors.neutral[0]} />
        <Typography weight="semibold" className="text-neutral-0 text-2xl">
          8 500 ₽
        </Typography>
      </View>
    </View>
  );
};

export default SpecialistHomeAssistant;
