import React from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { colors } from "@/src/styles/colors";
import AuthFooter from "@/src/components/auth/layout/footer";

const Experience = () => {
  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Пропустить",
            variant: "clear",
            onPress: () => {
              router.push(Routers.auth.personalInformation);
            },
          }}
        />
      }
    >
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Опыт работы
        </Typography>
        <Typography className="text-body text-neutral-500">
          Поможем настроить приложение под тебя
        </Typography>
        <View className="gap-3 mt-9">
          <Card
            title="Я профи"
            subtitle="Работал в Yclients / Dikidi / CRM"
            onPress={() => {
              router.push(Routers.auth.database);
            }}
            rightIcon={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
            leftIcon={
              <StSvg name="Star_fill" size={24} color={colors.neutral[900]} />
            }
          />
          <Card
            title="Вёл запись вручную"
            subtitle="Блокнот / Excel"
            onPress={() => {
              router.push(Routers.auth.database);
            }}
            rightIcon={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
            leftIcon={
              <StSvg
                name="File_dock_fill"
                size={24}
                color={colors.neutral[900]}
              />
            }
          />
          <Card
            title="Только начинаю"
            subtitle="Нет базы клиентов"
            onPress={() => {
              router.push(Routers.auth.personalInformation);
            }}
            rightIcon={
              <StSvg
                name="Expand_right_light"
                size={24}
                color={colors.neutral[500]}
              />
            }
            leftIcon={
              <StSvg name="Blank_fill" size={24} color={colors.neutral[900]} />
            }
          />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default Experience;
