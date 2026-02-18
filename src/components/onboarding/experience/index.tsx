import React, { useCallback, useMemo } from "react";
import AuthHeader from "@/src/components/auth/layout/header";
import { View } from "react-native";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import { colors } from "@/src/styles/colors";
import AuthFooter from "@/src/components/auth/layout/footer";

const Experience = () => {
  const handleProfExperience = useCallback(() => {
    router.push(Routers.onboarding.database);
  }, []);

  const handleManualExperience = useCallback(() => {
    router.push(Routers.onboarding.database);
  }, []);

  const handleNewbieExperience = useCallback(() => {
    router.push(Routers.onboarding.personalInformation);
  }, []);

  const handleSkip = useCallback(() => {
    router.push(Routers.onboarding.personalInformation);
  }, []);

  const experienceOptions = useMemo(
    () => [
      {
        title: "Я профи",
        subtitle: "Работал в Yclients / Dikidi / CRM",
        onPress: handleProfExperience,
        leftIcon: (
          <StSvg name="Star_fill" size={24} color={colors.neutral[900]} />
        ),
      },
      {
        title: "Вёл запись вручную",
        subtitle: "Блокнот / Excel",
        onPress: handleManualExperience,
        leftIcon: (
          <StSvg name="File_dock_fill" size={24} color={colors.neutral[900]} />
        ),
      },
      {
        title: "Только начинаю",
        subtitle: "Нет базы клиентов",
        onPress: handleNewbieExperience,
        leftIcon: (
          <StSvg name="Blank_fill" size={24} color={colors.neutral[900]} />
        ),
      },
    ],
    [handleProfExperience, handleManualExperience, handleNewbieExperience],
  );

  return (
    <AuthScreenLayout
      header={<AuthHeader />}
      footer={
        <AuthFooter
          primary={{
            title: "Пропустить",
            variant: "clear",
            onPress: handleSkip,
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
          {experienceOptions.map((item) => (
            <Card
              key={item.title}
              title={item.title}
              subtitle={item.subtitle}
              onPress={item.onPress}
              rightIcon={
                <StSvg
                  name="Expand_right_light"
                  size={24}
                  color={colors.neutral[500]}
                />
              }
              leftIcon={item.leftIcon}
            />
          ))}
        </View>
      </View>
    </AuthScreenLayout>
  );
};

export default Experience;
