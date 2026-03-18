import React from "react";
import { View } from "react-native";
import { StSvg, Divider, Tag } from "@/src/components/ui";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ParallaxScrollView from "@/src/components/parallaxScrollView";
import { colors } from "@/src/styles/colors";
import ScheduleSelectRow from "@/src/components/shared/cards/scheduleSelectRow";
import HomeCard from "@/src/components/shared/cards/homeCard";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";

import HomeNotificationsBlock from "@/src/components/app/root/homeNotificationsBlock";
import SpecialistHomeAssistantEmpty from "@/src/components/app/root/specialistHomeAssistantEmpty";
import SpecialistHomeAssistant from "@/src/components/app/root/specialistHomeAssistant";
import DateHeader from "@/src/components/app/root/dateHeader";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";

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
      headerContent={
        <View
          className="flex-1 px-screen pb-4 justify-between"
          style={{
            marginLeft: left,
            marginRight: right,
          }}
        >
          <View className="flex-1 justify-center gap-8 mt-4">
            <DateHeader />
            <SpecialistHomeAssistant />
            {/*<SpecialistHomeAssistantEmpty />*/}
          </View>

          <View className="gap-2">
            <ScheduleSelectRow />
            <HomeNotificationsBlock />
          </View>
        </View>
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
              onPress={() => router.push(Routers.app.menu.schedule)}
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
              onPress={() => router.push(Routers.app.menu.finances)}
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
              onPress={() => router.push(Routers.app.menu.services.root)}
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
              onPress={() => router.push(Routers.app.menu.account)}
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
