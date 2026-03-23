import React from "react";
import { View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

const Gallery = () => {
  return (
    <ScreenWithToolbar title="Галерея">
      {() => <View className="flex-1" />}
    </ScreenWithToolbar>
  );
};

export default Gallery;
