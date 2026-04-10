import React from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { IconButton, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import type { ToolbarContextValue } from "@/src/components/shared/layout/toolbarContext";

type Props = {
  toolbar: ToolbarContextValue | null;
};

const ClientsToolbarButton = ({ toolbar }: Props) => {
  return (
    <View className="items-end w-[48px] h-[48px]">
      <View className="absolute right-0 flex-row bg-background-surface h-[48px] items-center gap-2 rounded-full px-2">
        <IconButton
          size="sm"
          onPress={() => router.push(Routers.app.clients.create)}
          accessibilityLabel="Добавить клиента"
          icon={
            <StSvg name="Add_round" size={24} color={colors.neutral[900]} />
          }
        />
        <IconButton
          size="sm"
          onPress={toolbar?.openSearch}
          accessibilityLabel="Поиск"
          icon={<StSvg name="Search" size={28} color={colors.neutral[900]} />}
        />
      </View>
    </View>
  );
};

export default ClientsToolbarButton;
