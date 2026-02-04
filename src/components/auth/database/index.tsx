import React from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { colors } from "@/src/styles/colors";

const Database = () => {
  return (
    <AuthScreenLayout header={<AuthHeader />}>
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          База клиентов
        </Typography>
        <Typography className="text-body text-neutral-500">
          Поможем настроить приложение под тебя
        </Typography>
        <View className="gap-3 mt-9 flex-row">
          <View className="flex-1">
            <Button
              title="Да, хочу перенести"
              variant="secondary"
              direction="vertical"
              textVariant="accent"
              size="lg"
              iconLeft={
                <StSvg
                  name="Arhive_alt_add_fill"
                  size={24}
                  color={colors.primary.blue[500]}
                />
              }
              onPress={() => {
                router.push(Routers.auth.databaseSuccess);
              }}
            />
          </View>
          <View className="flex-1">
            <Button
              title="Нет, начну с нуля"
              direction="vertical"
              size="lg"
              iconLeft={
                <StSvg name="Blank_fill" size={24} color={colors.neutral[0]} />
              }
              onPress={() => {
                router.push(Routers.auth.personalInformation);
              }}
            />
          </View>
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default Database;
