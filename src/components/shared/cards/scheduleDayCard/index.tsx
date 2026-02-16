import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Checkbox, Typography } from "@/src/components/ui";
import { format, getDate } from "date-fns";

type Props = {
  date: Date;
  hasSchedule?: boolean;
  isSelected?: boolean;
  showCheckbox?: boolean;
  onPress?: () => void;
};

const ScheduleDayCard = ({
  date,
  hasSchedule,
  showCheckbox,
  isSelected,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className={`flex-1 px-4 pt-4 pb-2.5 rounded-base
       ${isSelected ? "bg-background border border-neutral-200" : "bg-background-surface border border-transparent"} 
       min-h-[102px] justify-between`}
    >
      <View className="flex-row justify-between items-center">
        <Typography
          weight="semibold"
          className={`text-body ${isSelected || hasSchedule ? "text-neutral-900" : "text-neutral-500"}`}
        >
          {getDate(date)}
        </Typography>
        <Typography
          weight="semibold"
          className="text-body text-neutral-500 capitalize"
        >
          {format(date, "EEEEEE")}
        </Typography>
      </View>

      <View className="flex-row justify-between items-center">
        {hasSchedule && (
          <View className="bg-primary-blue-100 rounded-lg py-1 px-2">
            <Typography
              weight="regular"
              className="text-primary-blue-500 text-caption"
            >
              11:00 - 19:00
            </Typography>
          </View>
        )}

        {showCheckbox && <Checkbox value={!!isSelected} pressable={false} />}
      </View>
    </TouchableOpacity>
  );
};

export default ScheduleDayCard;
