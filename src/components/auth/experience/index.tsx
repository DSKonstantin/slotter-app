import React from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import { Card, Typography } from "@/src/components/ui";
import Feather from "@expo/vector-icons/Feather";
import AntDesign from "@expo/vector-icons/AntDesign";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

const Experience = () => {
  return (
    <SafeAreaView className="flex-1 px-5">
      <AuthHeader />
      <View className="mt-14">
        <Typography weight="semibold" className="text-display mb-2">
          Опыт работы
        </Typography>
        <Typography weight="medium" className="text-body text-gray">
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
              <Feather name="chevron-right" size={24} color="#8E8E93" />
            }
            leftIcon={<AntDesign name="star" size={24} color="black" />}
          />
          <Card
            title="Вёл запись вручную"
            subtitle="Блокнот / Excel"
            onPress={() => {
              router.push(Routers.auth.database);
            }}
            rightIcon={
              <Feather name="chevron-right" size={24} color="#8E8E93" />
            }
            leftIcon={<AntDesign name="star" size={24} color="black" />}
          />
          <Card
            title="Только начинаю"
            subtitle="Нет базы клиентов"
            onPress={() => {
              router.push(Routers.auth.personalInformation);
            }}
            rightIcon={
              <Feather name="chevron-right" size={24} color="#8E8E93" />
            }
            leftIcon={<AntDesign name="star" size={24} color="black" />}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default Experience;
