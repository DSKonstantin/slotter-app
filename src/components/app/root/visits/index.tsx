import React from "react";
import { Image } from "expo-image";
import { Typography } from "@/src/components/ui";
import { Pressable, ScrollView, View } from "react-native";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";

const rearView = require("@/assets/images/app/rear_view.png");
const watch = require("@/assets/images/app/watch.png");

const Visits = () => {
  return (
    <View>
      <View className="flex-row items-center justify-between px-4 mt-5">
        <Typography weight="semibold" className="text-title">
          Визиты
        </Typography>
        <Pressable className="flex-row items-center gap-1 active:opacity-70">
          <Typography className="text-caption text-neutral-500">Все</Typography>
          <StSvg name="Expand_right" size={14} color={colors.neutral[500]} />
        </Pressable>
      </View>
      <View className="items-center justify-center -mt-10">
        <Image
          source={rearView}
          style={{ width: "100%", aspectRatio: 1 }}
          contentFit="contain"
        />
        <Image
          source={watch}
          style={{ position: "absolute", width: 150, height: 150, top: 70 }}
          contentFit="contain"
        />
        <Typography
          className="absolute text-center text-neutral-900 text-[20px] font-semibold"
          style={{ top: 170 }}
        >
          {"Скоро здесь будут\nваши привычки..."}
        </Typography>
      </View>
    </View>
  );
};

export default Visits;
