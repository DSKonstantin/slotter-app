import React from "react";
import { TouchableOpacity, View } from "react-native";
import { twMerge } from "tailwind-merge";
import { Typography } from "@/src/components/ui";

type Props = {
  title: string;
  subtitle: string;
  disabled?: boolean;
  leftIcon?: React.ReactNode;
  onPress?: () => void;
  className?: string;
};

const CreateActionCard = ({
  leftIcon,
  title,
  disabled,
  subtitle,
  onPress,
  className,
}: Props) => {
  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled}
      style={{
        ...(disabled && { opacity: 0.4 }),
      }}
      className={twMerge(
        "px-4 py-3.5 bg-background-surface flex-row rounded-base gap-4 items-center",
        className,
      )}
      onPress={onPress}
    >
      {leftIcon}
      <View className="flex-1">
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
