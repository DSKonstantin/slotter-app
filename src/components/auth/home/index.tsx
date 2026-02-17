import React, { useCallback } from "react";
import { View } from "react-native";
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
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="px-screen">
        <AuthHeader showBack={false} />
      </View>
      <View className="flex-1 justify-between">
        <View className="justify-center items-center px-screen flex-1">
          <Typography weight="semibold" className="text-display mb-2">
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

        <View className="gap-8">
          <View className="gap-4 px-screen">
            <Button
              title="Я тут впервые"
              variant="clear"
              onPress={handleRegister}
            />
            <Button title="Войти в аккаунт" onPress={handleLogin} />
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
    </SafeAreaView>
  );
};

export default AuthHome;
