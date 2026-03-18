import React, { useCallback } from "react";
import { View, useWindowDimensions } from "react-native";
import { Button, Typography } from "@/src/components/ui";
import { Image } from "expo-image";
import authHomeImage from "@/assets/images/auth/auth-home.png";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "@/src/components/auth/layout/header";

const AuthHome = () => {
  const { width } = useWindowDimensions();

  const handleRegister = useCallback(() => {
    router.push(Routers.auth.verify);
  }, []);

  const handleLogin = useCallback(() => {
    router.push(Routers.auth.login);
  }, []);

  const handleImageError = useCallback((error: any) => {
    console.error("Auth home image failed to load:", error);
  }, []);

  // Responsive image size: max 400px or 90% of screen width
  const maxImageSize = Math.min(width - 40, 400);

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="px-screen">
        <AuthHeader showBack={false} />
      </View>
      <View className="flex-1 justify-between">
        <View className="flex-1 justify-center items-center px-screen">
          <View className="gap-2">
            <Typography weight="semibold" className="text-display">
              Управляй своим{" "}
              <Typography
                weight="semibold"
                className="text-display text-primary-blue-500"
              >
                бизнесом
              </Typography>
            </Typography>
            <Typography className="text-neutral-500 text-center">
              Веди запись, график и базу клиентов {"\n"} в одном приложении
            </Typography>
          </View>
        </View>

        <View className="gap-8">
          <View className="gap-4 px-screen">
            <Button
              title="Я тут впервые"
              variant="clear"
              onPress={handleRegister}
              buttonProps={{
                accessibilityLabel: "Регистрация в приложении",
              }}
            />
            <Button
              title="Войти в аккаунт"
              onPress={handleLogin}
              buttonProps={{
                accessibilityLabel: "Вход в существующий аккаунт",
              }}
            />
          </View>

          <View className="items-center justify-center">
            <Image
              source={authHomeImage}
              style={{
                width: maxImageSize,
                height: maxImageSize,
              }}
              contentFit="contain"
              accessible={false}
              onError={handleImageError}
            />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default AuthHome;
