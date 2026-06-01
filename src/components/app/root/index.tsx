import React from "react";
import { ScrollView } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import HomeHeader from "@/src/components/app/root/homeHeader";
import MySpecialists from "@/src/components/app/root/mySpecialists";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import Visits from "@/src/components/app/root/visits";

const Home = () => {
  const { bottom } = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1" edges={["left", "right"]}>
      <HomeHeader />
      <ScrollView
        showsVerticalScrollIndicator={false}
        bounces={false}
        overScrollMode="never"
        contentContainerStyle={{ paddingBottom: TAB_BAR_HEIGHT + bottom }}
      >
        <MySpecialists />
        <Visits />
      </ScrollView>
    </SafeAreaView>
  );
};

export default Home;
