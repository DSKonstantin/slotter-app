import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Divider, Item, StSvg } from "@/src/components/ui";
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
                <StSvg
                  name="Meatballs_menu"
                  size={24}
                  color={colors.neutral[900]}
                />
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
            {/*<Divider className="ml-12 mr-4 flex-1 w-auto" />*/}
            {/*<Item*/}
            {/*  title="Электронная почта"*/}
            {/*  left={*/}
            {/*    <StSvg name="Mail_fill" size={24} color={colors.neutral[900]} />*/}
            {/*  }*/}
            {/*  className="border-0 rounded-none"*/}
            {/*  right={*/}
            {/*    <StSvg*/}
            {/*      name="Expand_right"*/}
            {/*      size={20}*/}
            {/*      color={colors.neutral[400]}*/}
            {/*    />*/}
            {/*  }*/}
            {/*  onPress={() => router.push(Routers.app.account.security.email)}*/}
            {/*/>*/}
          </View>
        </View>
      )}
    </ScreenWithToolbar>
  );
};

export default SecurityScreen;
