import React from "react";
import { View } from "react-native";
import { Button, Typography } from "@/src/components/ui";
import { Image } from "expo-image";
import authHomeImage from "@/assets/images/auth/auth-home.png";
import { Routers } from "@/src/constants/routers";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import AuthHeader from "@/src/components/auth/layout/header";

const AuthHome = () => {
  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <View className="px-5">
        <AuthHeader showBack={false} />
      </View>
      <View className="flex-1 justify-between">
        <View className="justify-center items-center px-5 flex-1">
          <Typography weight="semibold" className="text-display mb-2">
            Управляй своим{" "}
            <Typography
              weight="semibold"
              className="text-display text-primary-blue-500 text-center"
            >
              бизнесом
            </Typography>
          </Typography>
          <Typography className="text-neutral-500 text-center">
            Веди запись, график и базу клиентов {"\n"} в одном приложении
          </Typography>
        </View>

        <View className="gap-8">
          <View className="gap-4 px-5">
            <Button
              title="Я тут впервые"
              variant="clear"
              onPress={() => router.push(Routers.auth.verify)}
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
    </SafeAreaView>
  );
};

export default AuthHome;
