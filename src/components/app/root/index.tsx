import React from "react";
import { ScrollView, View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import ScheduleSelectRow from "@/src/components/shared/cards/scheduleSelectRow";

import HomeHeader from "@/src/components/app/root/homeHeader";
import HomeOverview from "@/src/components/app/root/homeOverview";
import HomeNotificationsBlock from "@/src/components/app/root/homeNotificationsBlock";

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
          <HomeOverview />

          {/*<View className="gap-2 mb-4">*/}
          {/*  <ScheduleSelectRow />*/}
          {/*  <HomeNotificationsBlock />*/}
          {/*</View>*/}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
