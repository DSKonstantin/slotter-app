import React from "react";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

const DatabaseSuccess = () => {
  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Хорошо",
            onPress: () => router.push(Routers.auth.personalInformation),
          }}
        />
      }
    >
      <View className="mt-16 items-center gap-3">
        <StSvg name="Upload_fill" size={60} color="black" />
        <Typography weight="semibold" className="text-display text-center">
          Договорились!
        </Typography>
        <Typography weight="medium" className="text-body text-gray text-center">
          Мы активировали инструмент импорта{"\n"}для твоего аккаунта
        </Typography>

        <Typography weight="medium" className="text-body text-gray text-center">
          Сейчас давай быстренько настроим услуги {"\n"}и график, а сразу после
          этого мы покажем,{"\n"}как загрузить клиентов
        </Typography>
      </View>
    </AuthScreenLayout>
  );
};

export default DatabaseSuccess;
