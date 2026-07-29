import React from "react";
import { View } from "react-native";

import {
  StoryHeading,
  StoryScreenLayout,
  StoryIllustration,
  StoryInlineIcon,
} from "@/src/components/app/root/insightsCarousel/components";

const FillProfileThree = () => {
  return (
    <StoryScreenLayout paddingTop={68}>
      <View className="px-screen">
        <StoryHeading
          title={
            <>
              Если у вас пустой профиль — вы <StoryInlineIcon name="Info" />{" "}
              незнакомец. Клиент <StoryInlineIcon name="User_fill" /> уйдет туда
              где всё понятно
            </>
          }
          subtitle="Используйте теги, загружайте сочные фотографии своих работ в галлерею, и пишите о себе, не надо стесняться"
        />
      </View>

      <StoryIllustration
        source={require("@/assets/images/history/fill_profile/three.webp")}
      />
    </StoryScreenLayout>
  );
};

export default FillProfileThree;
