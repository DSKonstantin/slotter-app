import React from "react";
import { TouchableOpacity, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  day?: number;
  isWorking?: boolean;
  scheduleTime?: string;
  hasAppointments?: boolean;
  isSelected?: boolean;
  isToday?: boolean;
  onPress?: () => void;
};

const ScheduleDayCard = ({
  day,
  isWorking,
  scheduleTime,
  hasAppointments,
  isSelected,
  isToday,
  onPress,
}: Props) => {
  const [start, end] = scheduleTime?.split(" - ") ?? [];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={0.7}
      className={`flex-1 mx-[1px] rounded-xl p-1.5 justify-between ${
        isSelected && isWorking
          ? "bg-accent-yellow-500"
          : isSelected
            ? "bg-primary-green-500"
            : !isWorking
              ? "bg-neutral-100"
              : "bg-white"
      }`}
    >
      <View className="flex-row justify-between items-start">
        <Typography
          weight="semibold"
          className={`text-body ${
            isToday
              ? "text-primary-blue-500"
              : isWorking || isSelected
                ? "text-neutral-900"
                : "text-neutral-400"
          }`}
        >
          {day}
        </Typography>
        {hasAppointments && (
          <View className="w-2 h-2 rounded-[2px] bg-primary-blue-500 mt-0.5" />
        )}
      </View>

      {isSelected ? (
        <View className="flex-1 items-center justify-center">
          <StSvg name="Done_round" size={24} color={colors.neutral["900"]} />
        </View>
      ) : (
        isWorking &&
        start && (
          <View>
            <Typography
              weight="regular"
              className="text-[10px] text-neutral-500 leading-tight"
            >
              {start}–
            </Typography>
            <Typography
              weight="regular"
              className="text-[10px] text-neutral-500 leading-tight"
            >
              {end}
            </Typography>
          </View>
        )
      )}
    </TouchableOpacity>
  );
};

export default ScheduleDayCard;
