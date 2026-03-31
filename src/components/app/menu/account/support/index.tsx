import React from "react";
import { View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

const Support = () => {
  return (
    <ScreenWithToolbar title="Поддержка">
      {() => <View className="flex-1" />}
    </ScreenWithToolbar>
  );
};

export default Support;
