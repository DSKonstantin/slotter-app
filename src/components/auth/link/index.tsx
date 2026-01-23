import React from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthFooter from "@/src/components/auth/layout/footer";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";

const Link = () => {
  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Поделиться ссылкой",
            onPress: () => {},
          }}
          secondary={{
            title: "Перейти в кабинет",
            onPress: () => {
              router.push(Routers.auth.root);
            },
          }}
        />
      }
    >
      <View className="mt-16">
        <View className="items-center mb-3">
          <StSvg name="Check_fill" size={60} color="black" />
        </View>
        <Typography weight="semibold" className="text-display text-center">
          Всё готово!
        </Typography>
        <Typography
          weight="medium"
          className="text-body text-center text-gray mt-2"
        >
          Твоя ссылка для записи создана
        </Typography>

        <View>
          <Typography weight="medium" className="text-accent">
            slotter.app/ivan_barber
          </Typography>

          <StSvg name="Copy_alt" size={60} color="#0088FF" />
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default Link;
