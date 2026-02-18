import React from "react";
import { View } from "react-native";
import { Typography } from "@/src/components/ui";

const DayCard = ({ day, weekDay }: { day: number; weekDay: string }) => {
  return (
    <View className="bg-background-surface rounded-2xl p-4 items-center w-24">
      <View className="flex-row justify-between w-full">
        <Typography weight="semibold">{day}</Typography>
        <Typography className="text-neutral-500">{weekDay}</Typography>
      </View>
    </View>
  );
};

export default DayCard;
