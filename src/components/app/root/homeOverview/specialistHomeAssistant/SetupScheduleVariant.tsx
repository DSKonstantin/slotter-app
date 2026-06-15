import React, { memo } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";
import { LinkView } from "@/src/components/shared/linkView";

function SetupScheduleVariantComponent() {
  return (
    <View className="gap-3">
      <Typography weight="semibold" className="text-lg">
        Расписание закрыто. Клиенты не могут к вам записаться. Откройте его в
        разделе{" "}
        <Typography weight="extrabold" className="text-lg">
          График
        </Typography>{" "}
        или по кнопке ниже.
      </Typography>

      <LinkView
        link="Открыть график"
        iconName="Arrow_alt_lright"
        onPress={() => router.push(Routers.app.schedule)}
      />
    </View>
  );
}

export default memo(SetupScheduleVariantComponent);
