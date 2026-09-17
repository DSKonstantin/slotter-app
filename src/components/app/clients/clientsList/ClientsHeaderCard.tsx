import React from "react";
import { Pressable, View } from "react-native";

import { Badge, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  iconName: string;
  label: string;
  badge?: string;
  disabled?: boolean;
  onPress: () => void;
};

const ClientsHeaderCard = ({
  iconName,
  label,
  badge,
  disabled,
  onPress,
}: Props) => (
  <Pressable
    disabled={disabled}
    onPress={onPress}
    className={`min-h-[98px] flex-1 bg-background-surface p-4 rounded-base justify-between active:opacity-70 ${
      disabled ? "opacity-40" : ""
    }`}
  >
    <View className="flex-row justify-between items-center">
      <View className="flex-row items-center gap-2">
        <StSvg name={iconName} size={24} color={colors.neutral[900]} />
        {badge && <Badge title={badge} variant="accent" size="sm" />}
      </View>
      <StSvg name="Expand_right_light" size={24} color={colors.neutral[500]} />
    </View>
    <Typography weight="semibold" className="text-body">
      {label}
    </Typography>
  </Pressable>
);

export default ClientsHeaderCard;
