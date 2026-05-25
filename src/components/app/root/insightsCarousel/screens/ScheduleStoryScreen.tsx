import React from "react";
import { Image, View } from "react-native";

import { Button, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { LinearGradient } from "expo-linear-gradient";

const ScheduleStoryScreen = () => (
  <View style={{ flex: 1 }}>
    <LinearGradient
      colors={["#FFFFFF00", "#FFEDFF", "#FFD7FF"]}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 600,
      }}
    />

    <View style={{ flex: 1, paddingTop: 16 }}>
      <View className="px-6">
        <Typography weight="bold" className="text-[26px] text-neutral-900">
          Заполни профиль один раз и клиенты сразу видят кто ты
        </Typography>

        <Typography className="text-[16px] text-neutral-500">
          Имя, фото, специализация и ссылка для записи
        </Typography>
      </View>

      <Image
        source={require("@/assets/images/history/account.png")}
        style={{ flex: 1, width: "100%" }}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default ScheduleStoryScreen;
