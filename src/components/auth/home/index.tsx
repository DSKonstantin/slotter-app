import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Button, Typography } from "@/src/components/ui";
import { Image } from "expo-image";
import authHomeImage from "@/assets/images/auth/auth-home.png";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "@/src/components/auth/layout/header";

const AuthHome = () => {
  const handleRegister = useCallback(() => {
    router.push(Routers.auth.verify);
  }, []);

  const handleLogin = useCallback(() => {
    router.push(Routers.auth.login);
  }, []);

  return (
    <View className="flex-1">
      <Image
        source={authHomeImage}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        accessible={false}
      />
      <SafeAreaView className="flex-1">
        <View className="px-screen">
          <AuthHeader showBack={false} title="slotter" />
        </View>
        <View className="flex-1 justify-between gap-8">
          <View className="flex-1 justify-end items-center px-screen">
            <View className="gap-2">
              <Typography
                weight="semibold"
                className="text-3xl text-center text-neutral-0"
              >
                Веди свои привычки
              </Typography>
              <Typography className=" text-body text-neutral-0 text-center">
                Удобно общайся, сохраняй {"\n"} и бронируй специалистов со
                Slotter
              </Typography>
            </View>
          </View>

          <View className="gap-4 px-screen">
            <Button
              title="Войти в аккаунт"
              variant="secondary"
              onPress={handleLogin}
              buttonProps={{
                accessibilityLabel: "Вход в существующий аккаунт",
              }}
            />
            <Button
              title="Я тут впервые"
              variant="clear"
              textClassName="text-neutral-0"
              onPress={handleRegister}
              buttonProps={{
                accessibilityLabel: "Регистрация в приложении",
              }}
            />
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

export default AuthHome;
