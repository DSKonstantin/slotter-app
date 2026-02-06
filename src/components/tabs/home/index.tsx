import React from "react";
import {  View } from "react-native";
import { Typography, Avatar, StSvg, Divider, Tag } from "@/src/components/ui";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import ParallaxScrollView from "@/src/components/parallaxScrollView";
import { colors } from "@/src/styles/colors";
import ScheduleSelectRow from "@/src/components/shared/cards/scheduleSelectRow";
import photoImage from "@/assets/mock/images/Photo.png";
import HomeCard from "@/src/components/shared/cards/homeCard";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";

import HomeNotificationsBlock from "@/src/components/tabs/home/HomeNotificationsBlock";

const Home = () => {
  const { bottom, top, left, right } = useSafeAreaInsets();

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: colors.background.black,
        dark: colors.background.black,
      }}
      headerHeight={500}
      contentInset={{
        top,
        right,
        left,
        bottom: TAB_BAR_HEIGHT + bottom + 16,
      }}
      headerImage={
        <SafeAreaView
          className="flex-1 px-screen pb-4 justify-between"
          edges={["left", "right"]}
        >
          <View className="flex-1 justify-center">
            <View className="flex-row justify-between">
              <View className="flex-row justify-center gap-2">
                <Typography
                  weight="bold"
                  className="text-5xl text-neutral-0 leading-[40px]"
                >
                  Вт
                </Typography>
                <View className="bg-primary-green-500 w-[26px] h-[26px] rounded-lg" />
              </View>

              <View className="items-end">
                <Typography
                  weight="semibold"
                  className="text-2xl text-neutral-600 text-right"
                >
                  Декабрь 16
                </Typography>
                <Typography
                  weight="semibold"
                  className="text-2xl text-neutral-700 text-right"
                >
                  2025
                </Typography>
              </View>
            </View>
            <View className="mt-8">
              <View className="flex-row gap-1 items-center">
                <Typography className="text-neutral-700 text-2xl">
                  Доброе утро,
                </Typography>
                <Avatar size="xs" uri={photoImage} />
                <Typography className="text-neutral-0 text-2xl">
                  Ирина
                </Typography>
              </View>

              <View className="flex-row gap-1 items-center">
                <Typography className="text-neutral-700 text-2xl">
                  У тебя сегодня
                </Typography>
                <StSvg
                  name="Date_range_fill"
                  size={24}
                  color={colors.neutral[0]}
                />
                <Typography className="text-neutral-0 text-2xl">
                  4 записи
                </Typography>
              </View>

              <View className="flex-row gap-1 items-center">
                <Typography className="text-neutral-700 text-2xl">
                  Ближайшая начнется в
                </Typography>
                <Typography className="text-neutral-0 text-2xl">
                  14:00
                </Typography>
              </View>

              <View className="flex-row gap-1 items-center">
                <Typography className="text-neutral-700 text-2xl">
                  Доход за день
                </Typography>
                <StSvg name="Wallet_fill" size={24} color={colors.neutral[0]} />
                <Typography className="text-neutral-0 text-2xl">
                  8 500 ₽
                </Typography>
              </View>
            </View>
          </View>

          <View className="gap-2">
            <ScheduleSelectRow />
            <HomeNotificationsBlock />
          </View>
        </SafeAreaView>
      }
    >
      <View className="flex-1 px-screen pt-2">
        <View className="items-center justify-center">
          <View className="w-20">
            <Divider className="h-[4px] rounded-large" />
          </View>
        </View>

        <View className="mt-9 gap-3">
          <View className="flex-row gap-3">
            <HomeCard
              title="График"
              startAdornment={
                <StSvg
                  name="Date_today"
                  size={26}
                  color={colors.neutral[900]}
                />
              }
              endAdornment={
                <StSvg
                  name="Alarm_fill"
                  size={24}
                  color={colors.accent.red[500]}
                />
              }
            />
            <HomeCard
              title="Клиенты"
              startAdornment={
                <StSvg
                  name="Group_fill"
                  size={26}
                  color={colors.neutral[900]}
                />
              }
              endAdornment={<Tag title="+2%" variant="info" size="sm" />}
            />
          </View>
          <View className="flex-row gap-3">
            <HomeCard
              title="Финансы"
              startAdornment={
                <StSvg
                  name="Wallet_fill"
                  size={26}
                  color={colors.neutral[900]}
                />
              }
              endAdornment={<Tag title="+6%" variant="info" size="sm" />}
            />
            <HomeCard
              title="Услуги"
              startAdornment={
                <StSvg
                  name="Desk_alt_fill"
                  size={26}
                  color={colors.neutral[900]}
                />
              }
              endAdornment={<Tag title="12" variant="info" size="sm" />}
            />
          </View>
          <View className="flex-row gap-3">
            <HomeCard
              title="Аккаунт"
              startAdornment={
                <StSvg
                  name="User_circle"
                  size={26}
                  color={colors.neutral[900]}
                />
              }
              endAdornment={
                <StSvg
                  name="Alarm_fill"
                  size={24}
                  color={colors.accent.red[500]}
                />
              }
            />
            <HomeCard
              disabled
              title="Акции"
              startAdornment={
                <StSvg name="Percent" size={26} color={colors.neutral[900]} />
              }
              endAdornment={<Tag title="0 активно" size="sm" />}
            />
          </View>
        </View>
      </View>
    </ParallaxScrollView>
  );
};

export default Home;
