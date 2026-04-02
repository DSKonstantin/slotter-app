import React from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { StSvg, Typography } from "@/src/components/ui";
import { formatShortDayName } from "@/src/utils/date/formatDate";
import { formatDayMonth } from "@/src/utils/date/formatTime";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import ScheduleSelectRow from "@/src/components/shared/cards/scheduleSelectRow";

import HomeHeader from "@/src/components/app/root/homeHeader";
import SpecialistHomeAssistant from "@/src/components/app/root/specialistHomeAssistant";
import HomeNotificationsBlock from "@/src/components/app/root/homeNotificationsBlock";
import { colors } from "@/src/styles/colors";

const today = new Date();
const dateChip = `Сегодня • ${formatShortDayName(today)} • ${formatDayMonth(today.toISOString())}`;

const Home = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1" edges={["top", "left", "right"]}>
      <HomeHeader />
      <ScrollView
        contentContainerStyle={{
          flex: 1,
          paddingBottom: TAB_BAR_HEIGHT + bottom + 16,
        }}
      >
        <View className="px-screen gap-3 mt-2 flex-1 justify-between">
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Typography
                weight="semibold"
                className="text-caption text-neutral-500"
              >
                Показатели
              </Typography>
              <View className="relative" style={{ width: 12, height: 20 }}>
                <StSvg
                  name="Expand_up_light"
                  size={12}
                  color={colors.neutral[500]}
                  style={{ position: "absolute", top: 0 }}
                />
                <View
                  className="absolute bottom-0"
                  style={{
                    transform: [{ rotate: "180deg" }],
                  }}
                >
                  <StSvg
                    name="Expand_up_light"
                    size={12}
                    color={colors.neutral[500]}
                  />
                </View>
              </View>
            </View>
            <View className="bg-background-card rounded-full flex-row items-center gap-2">
              <View className="w-4 h-4 bg-primary-green-500 rounded-md" />
              <Typography className="text-caption">{dateChip}</Typography>
            </View>

            <SpecialistHomeAssistant />
          </View>

          <View className="gap-2 mb-4">
            <ScheduleSelectRow />
            <HomeNotificationsBlock />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
