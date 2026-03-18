import React from "react";
import { View } from "react-native";
import { Avatar, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {};

const SpecialistHomeAssistantEmpty = ({}: Props) => {
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

      <Typography weight="semibold" className="text-neutral-700 text-2xl">
        Пока что, у тебя нет клиентов
      </Typography>
      <Typography className="text-neutral-700 text-2xl">
        Чтобы получить запись, нужно
      </Typography>
      <View className="flex-row gap-1 items-center">
        <Typography weight="semibold" className="text-neutral-700 text-2xl">
          поделиться
        </Typography>
        <StSvg name="Copy_alt" size={24} color={colors.neutral[0]} />
        <Typography
          weight="semibold"
          className="text-neutral-0 text-2xl underline"
        >
          своей ссылкой
        </Typography>
      </View>
    </View>
  );
};

export default SpecialistHomeAssistantEmpty;
