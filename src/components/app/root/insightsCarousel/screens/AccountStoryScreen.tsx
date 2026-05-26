import React from "react";
import {Image, View} from "react-native";

import { StSvg, Typography } from "@/src/components/ui";
import magazine from "@/assets/images/history/magazine.png";
import outline_account from "@/assets/images/history/outline_account.png";
import {LinearGradient} from "expo-linear-gradient";

const AccountStoryScreen = () => (
  <View style={{ flex: 1 }}>
    <Image
      source={require("@/assets/images/history/event_log.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="stretch"
    />
  </View>
);

export default AccountStoryScreen;
