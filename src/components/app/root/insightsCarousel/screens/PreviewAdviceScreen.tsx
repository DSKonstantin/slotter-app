import React from "react";
import { Image, View } from "react-native";

type Props = {
  onNext?: () => void;
};

const PreviewAdviceScreen = ({ onNext }: Props) => (
  <View style={{ flex: 1 }}>
    <Image
      source={require("@/assets/images/history/img.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="contain"
    />
  </View>
);

export default PreviewAdviceScreen;
