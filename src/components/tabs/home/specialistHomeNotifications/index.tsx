import React from "react";
import { TouchableOpacity, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  data: {
    iconName: string;
    iconColor: string;
    title: string;
    label?: string;
  };
  onPress?: () => void;
};

const SpecialistHomeNotifications = ({ data, onPress }: Props) => {
  return (
    <TouchableOpacity
      className="flex-row justify-between items-center bg-background-card rounded-base px-4 py-2 overflow-hidden"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="flex-row items-center gap-3 flex-1 min-w-0">
        <StSvg name={data.iconName} size={32} color={data.iconColor} />

        <View className="gap-2 min-h-[71px] justify-center">
          <Typography weight="semibold" className="text-body" numberOfLines={2}>
            {data.title}
          </Typography>
          <View className="flex-row items-center">
            <Typography
              weight="semibold"
              className="text-caption text-neutral-500 leading-none"
            >
              {data.label}
            </Typography>
            <StSvg
              name="Expand_right_light"
              size={16}
              color={colors.neutral[500]}
            />
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default SpecialistHomeNotifications;
