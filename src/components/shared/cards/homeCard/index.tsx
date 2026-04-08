import React from "react";
import { TouchableOpacity, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { twMerge } from "tailwind-merge";

type HomeCardProps = {
  title?: string;
  startAdornment?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
};

const HomeCard = ({
  title,
  startAdornment,
  onPress,
  disabled = false,
  className,
}: HomeCardProps) => {
  return (
    <TouchableOpacity
      disabled={disabled}
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        ...(disabled && { opacity: 0.4 }),
      }}
      className={twMerge(
        "flex-1 p-4 rounded-medium bg-background-surface",
        className,
      )}
    >
      <View className="flex-row justify-between items-center">
        {startAdornment && startAdornment}
      </View>

      <View className="mt-3">
        <Typography weight="semibold" className="text-body">
          {title}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

export default HomeCard;
