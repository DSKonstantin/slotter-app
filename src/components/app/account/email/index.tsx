import React from "react";
import { View } from "react-native";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";

const Email = () => {
  return (
    <ScreenWithToolbar title="Электронная почта">
      {({ topInset }) => <View style={{ paddingTop: topInset }} />}
    </ScreenWithToolbar>
  );
};

export default Email;
