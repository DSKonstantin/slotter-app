import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Item, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";

const SecurityScreen = () => {
  return (
    <ScreenWithToolbar title="Безопасность">
      {({ topInset }) => (
        <View style={{ paddingTop: topInset }} className="px-screen">
          <View className="bg-background-surface rounded-base overflow-hidden">
            <Item
              title="Сменить пароль"
              left={
                <StSvg name="Password" size={24} color={colors.neutral[900]} />
              }
              className="border-0 rounded-none"
              right={
                <StSvg
                  name="Expand_right"
                  size={20}
                  color={colors.neutral[400]}
                />
              }
              onPress={() =>
                router.push(Routers.app.account.security.changePassword)
              }
            />
          </View>
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default SecurityScreen;
