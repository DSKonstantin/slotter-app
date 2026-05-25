import React from "react";
import {Image, View} from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import magazine from "@/assets/images/history/magazine.png";
import outline_account from "@/assets/images/history/outline_account.png";
import {LinearGradient} from "expo-linear-gradient";

const AccountStoryScreen = () => (
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
          Уведомления, изменения и другие события в одном месте, не нужны блокноты и таблицы
        </Typography>

        <Typography className="text-[16px] text-neutral-500">
          Из этого раздела можно сразу подтвердить, перенести или отменить событие
        </Typography>
      </View>

      <Image
        source={require("@/assets/images/history/event_log.png")}
        style={{ flex: 1, width: "100%" }}
        resizeMode="contain"
      />
    </View>
  </View>
);

export default AccountStoryScreen;
