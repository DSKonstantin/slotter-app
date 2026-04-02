import React from "react";
import { Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

const HomeBannerCard = () => {
  return (
    <Pressable className="flex-row items-center gap-3 bg-background-card rounded-base p-4 active:opacity-70">
      <View
        className="w-10 h-10 rounded-full items-center justify-center"
        style={{ backgroundColor: colors.accent.yellow[500] }}
      >
        <StSvg name="Group_fill" size={20} color={colors.neutral[900]} />
      </View>

      <Typography weight="semibold" className="flex-1 text-body">
        Продолжим перенос базы клиентов?
      </Typography>

      <View className="flex-row items-center gap-0.5">
        <Typography className="text-caption text-primary-blue-500">
          Перейти
        </Typography>
        <StSvg
          name="Expand_right_light"
          size={16}
          color={colors.primary.blue[500]}
        />
      </View>
    </Pressable>
  );
};

export default HomeBannerCard;
