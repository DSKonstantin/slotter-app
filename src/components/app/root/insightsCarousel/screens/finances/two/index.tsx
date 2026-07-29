import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const FinancesTwo = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Ты знаешь сколько <StoryInlineIcon name="Money_fill" /> заработал
              за прошлый месяц?
            </>
          }
          subtitle="Большинство мастеров отвечают примерно. Финансы покажут точно."
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/finances/two.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FinancesTwo;
