import React from "react";
import { View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

const SlotDetailScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenWithToolbar title="Запись">
      {() => <View className="flex-1" />}
    </ScreenWithToolbar>
  );
};

export default SlotDetailScreen;
