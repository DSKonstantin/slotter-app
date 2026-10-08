import React from "react";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { getAppVersion } from "@/src/utils/appVersion";

type AboutAppItemProps = {
  userId: number;
};

const AboutAppItem = ({ userId }: AboutAppItemProps) => (
  <View className="flex-row items-start p-4 min-h-[60px]">
    <View className="mr-2">
      <StSvg name="Info_alt" size={24} color={colors.neutral[900]} />
    </View>
    <View className="flex-1 gap-0.5">
      <Typography className="text-body">О приложении</Typography>
      <Typography className="text-caption text-neutral-400">
        {`Ваш ID: ${userId} · Версия приложения: ${getAppVersion()}`}
      </Typography>
    </View>
  </View>
);

export default AboutAppItem;
