import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Typography, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  time: string;
  name: string;
  service: string;
  onPress?: () => void;
};

const AppointmentCard = ({ time, name, service, onPress }: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      className="bg-background-surface rounded-2xl px-5 py-4 flex-row items-center justify-between"
    >
      <View className="flex-1">
        <Typography
          weight="semibold"
          className="text-title text-neutral-900 mb-1"
        >
          {time}
        </Typography>

        <Typography
          weight="regular"
          className="text-body text-neutral-500"
          numberOfLines={1}
        >
          {name} · {service}
        </Typography>
      </View>

      <StSvg name="Expand_right_light" size={20} color={colors.neutral[400]} />
    </TouchableOpacity>
  );
};

export default AppointmentCard;
