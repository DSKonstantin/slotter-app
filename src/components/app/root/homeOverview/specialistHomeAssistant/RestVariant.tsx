import React, { memo } from "react";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

function RestVariantComponent() {
  return (
    <View className="gap-1">
      <View className="flex-row items-center gap-1">
        <Typography weight="semibold" className="text-xl text-neutral-900">
          Отдыхайте, записей нет
        </Typography>
        <StSvg name="cocktail_fill" size={20} color={colors.neutral[900]} />
      </View>
      <Typography weight="semibold" className="text-xl text-neutral-900">
        Сегодня можно не думать о работе, и сделать то, что давно хотели
      </Typography>
    </View>
  );
}

export default memo(RestVariantComponent);
