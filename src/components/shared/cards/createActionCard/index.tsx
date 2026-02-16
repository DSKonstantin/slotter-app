import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { Routers } from "@/src/constants/routers";

type Props = {
  title: string;
  subtitle: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
};

const CreateActionCard = ({
  leftIcon,
  title,
  disabled,
  subtitle,
  onPress,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      style={{
        ...(disabled && { opacity: 0.4 }),
      }}
      className="px-4 py-3.5 bg-background-surface flex-row rounded-base gap-4 items-center"
      onPress={onPress}
    >
      {leftIcon}
      <View>
        <Typography weight="semibold" className="text-body">
          {title}
        </Typography>
        <Typography weight="regular" className="text-caption text-neutral-500">
          {subtitle}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

export default CreateActionCard;
