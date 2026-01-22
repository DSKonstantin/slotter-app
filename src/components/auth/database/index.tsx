import React from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";
import { SafeAreaView } from "react-native-safe-area-context";

const Database = () => {
  return (
    <SafeAreaView className="flex-1 px-5">
      <AuthHeader />
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          База клиентов
        </Typography>
        <Typography weight="medium" className="text-body text-gray">
          Поможем настроить приложение под тебя
        </Typography>
        <View className="gap-3 mt-9"></View>
      </View>
    </SafeAreaView>
  );
};

export default Database;
