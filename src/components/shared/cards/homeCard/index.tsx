import React from "react";
import { TouchableOpacity, View } from "react-native";
import { StSvg, Tag, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { twMerge } from "tailwind-merge";

type HomeCardProps = {
  title?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
};

const HomeCard = ({
  title,
  startAdornment,
  endAdornment,
  onPress,
  disabled = false,
  className,
  children,
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
        {endAdornment && endAdornment}
      </View>

      <View className="mt-14">
        <Typography weight="semibold" className="text-body">
          {title}
        </Typography>
      </View>
    </TouchableOpacity>
  );
};

export default HomeCard;
