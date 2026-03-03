import React from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";

type AdditionalServicesHeaderProps = {
  activeCount: number;
  totalCount: number;
};

const AdditionalServicesHeader = ({
  activeCount,
  totalCount,
}: AdditionalServicesHeaderProps) => {
  return (
    <View className="flex-row justify-between">
      <Typography className="text-caption text-neutral-500">
        Дополнительные услуги
      </Typography>

      <Typography weight="regular" className="text-caption text-neutral-500">
        {activeCount}/{totalCount} активно
      </Typography>
    </View>
  );
};

export default React.memo(AdditionalServicesHeader);
