import React from "react";
import { Image, View } from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import magazine from "@/assets/images/history/magazine.png";
import long_circle from "@/assets/images/history/long_circle.png";
import {LinearGradient} from "expo-linear-gradient";

const ServicesStoryScreen = () => (
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
          Клиент открывает твою страницу, выбирает услугу
          и записывается без уточнений
        </Typography>

        <Typography className="text-[16px] text-neutral-500">
          Для каждой услуги указываешь название, цену, длительность и фото
        </Typography>
      </View>

      <Image
        source={require("@/assets/images/history/create_service.png")}
        style={{ flex: 1, width: "100%" }}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default ServicesStoryScreen;
