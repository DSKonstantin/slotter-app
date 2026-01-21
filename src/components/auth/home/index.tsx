import React from "react";
import { View } from "react-native";
import { Button, Typography } from "@/src/components/ui";
import { Image } from "expo-image";
import authHomeImage from "@/assets/images/auth/auth-home.png";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";

const AuthHome = () => {
  return (
    <View className="flex-1 justify-between">
      <View className="justify-center items-center px-5 flex-1">
        <Typography weight="semibold" className="text-display mb-2">
          Управляй своим{" "}
          <Typography
            weight="semibold"
            className="text-display text-accent text-center"
          >
            бизнесом
          </Typography>
        </Typography>
        <Typography weight="medium" className="text-gray text-center">
          Веди запись, график и базу клиентов {"\n"} в одном приложении
        </Typography>
      </View>

      <View className="gap-8">
        <View className="gap-4 px-5">
          <Button
            title="Я тут впервые"
            variant="clear"
            onPress={() => router.push(Routers.auth.register)}
          />
          <Button
            title="Войти в аккаунт"
            onPress={() => router.push(Routers.auth.login)}
          />
        </View>

        <View className="items-center">
          <Image
            source={authHomeImage}
            style={{
              width: "100%",
              aspectRatio: 1,
            }}
            contentFit="contain"
          />
        </View>
      </View>
    </View>
  );
};

export default AuthHome;
