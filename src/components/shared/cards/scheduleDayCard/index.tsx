import React from "react";
import { TouchableOpacity, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  day?: number;
  isWorking?: boolean;
  scheduleTime?: string;
  hasAppointments?: boolean;
  isOtherMonth?: boolean;
  isSelected?: boolean;
  onPress?: () => void;
};

const ScheduleDayCard = ({
  day,
  isWorking,
  scheduleTime,
  hasAppointments,
  isOtherMonth,
  isSelected,
  onPress,
}: Props) => {
  const [start, end] = scheduleTime?.split(" - ") ?? [];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isOtherMonth || !onPress}
      activeOpacity={0.7}
      className={`flex-1 mx-[1px] rounded-xl p-1.5 min-h-[70px] justify-between ${
        isOtherMonth || !isWorking ? "bg-neutral-100" : "bg-white"
      }`}
    >
      <View className="flex-row justify-between items-start">
        <Typography
          weight="semibold"
          className={`text-body ${
            isOtherMonth
              ? "text-neutral-300"
              : isWorking
                ? "text-neutral-900"
                : "text-neutral-400"
          }`}
        >
          {day}
        </Typography>
        {!isOtherMonth &&
          (isSelected ? (
            <StSvg
              name="Done_round"
              size={16}
              color={colors.primary?.blue[500]}
            />
          ) : (
            hasAppointments && (
              <View className="w-2 h-2 rounded-[2px] bg-primary-blue-500 mt-0.5" />
            )
          ))}
      </View>

      {isWorking && start && !isOtherMonth && (
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
      )}
    </TouchableOpacity>
  );
};

export default ScheduleDayCard;
