import React from "react";
import { StyleSheet, View } from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AppUpdateOne = () => {
  const { top, bottom } = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <Image
        source={require("@/assets/images/history/app_update/one.webp")}
        style={StyleSheet.absoluteFillObject}
        contentFit="cover"
      />

      <View
        className="flex-1 px-4"
        style={{ paddingTop: top + 68, paddingBottom: bottom + 16 }}
      >
        <Image
          source={require("@/assets/images/history/app_update/one-front.webp")}
          style={{ flex: 1, width: "100%" }}
          contentFit="contain"
        />
      </View>
    </View>
  );
};

export default AppUpdateOne;
