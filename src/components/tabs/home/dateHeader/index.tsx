import React from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";

const DateHeader = () => {
  return (
    <View className="flex-row justify-between items-center">
      <View className="flex-row justify-center gap-2 items-center">
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
  );
};

export default DateHeader;
