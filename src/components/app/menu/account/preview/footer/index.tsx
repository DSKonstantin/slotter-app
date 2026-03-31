import React from "react";
import { View, Text } from "react-native";
import { Typography } from "@/src/components/ui";

const Footer = () => {
  return (
    <View className="flex-row items-center gap-0.5 flex-1 justify-center mt-32">
      <Typography weight="semibold" className="text-xs text-neutral-400">
        работает на
      </Typography>
      <Text style={{ fontFamily: "TJF-Anomaly" }} className="text-body">
        slotter
      </Text>
    </View>
  );
};

export default Footer;
