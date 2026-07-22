import React, { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { Button, StSvg, Typography } from "@/src/components/ui";
import { Image } from "expo-image";
import authHomeImage from "@/assets/images/auth/auth-home.webp";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AuthHeader from "@/src/components/auth/layout/header";
import { colors } from "@/src/styles/colors";
import { LinearGradient } from "expo-linear-gradient";

const HEADER_HEIGHT = 120;

const AuthHome = () => {
  const { top } = useSafeAreaInsets();

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
      <LinearGradient
        colors={["rgba(0,0,0,0.55)", "transparent"]}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: top + HEADER_HEIGHT,
        }}
        pointerEvents="none"
      />
      <SafeAreaView className="flex-1">
        <View className="px-screen">
          <AuthHeader
            showBack={false}
            title={<StSvg name="union" size={25} color={colors.neutral[0]} />}
          />
        </View>
        <View className="flex-1 justify-between gap-8">
          <View className="flex-1 justify-end items-center px-screen">
            <View className="gap-2">
              <Typography
                weight="semibold"
                className="text-3xl text-center text-neutral-0"
              >
                Управляй своим делом
              </Typography>
              <Typography className=" text-body text-neutral-0 text-center">
                Веди запись, график и базу клиентов {"\n"} в одном приложении
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
