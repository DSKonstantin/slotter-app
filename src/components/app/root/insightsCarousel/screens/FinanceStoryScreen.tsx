import React from "react";
import { Image, View } from "react-native";

import { Typography } from "@/src/components/ui";
import services from "@/assets/images/history/services.png";
import outlineAccountImage from "@/assets/images/history/outline_account.png";
import {LinearGradient} from "expo-linear-gradient";

const FinanceStoryScreen = () => (
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
          Настрой рабочие часы. Клиенты сами найдут время и запишутся
        </Typography>

        <Typography className="text-[16px] text-neutral-500">
          Выбираешь дни и часы вручную, копируешь прошлый месяц или применяешь шаблон
        </Typography>
      </View>

      <Image
        source={require("@/assets/images/history/calendar.png")}
        style={{ flex: 1, width: "100%" }}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default FinanceStoryScreen;
