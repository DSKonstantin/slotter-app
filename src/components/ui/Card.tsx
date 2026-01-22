import React, { ReactNode } from "react";
import { Pressable, View, Text } from "react-native";
import { twMerge } from "tailwind-merge";

type CardProps = {
  title: string;
  subtitle?: string;
  caption?: string;

  leftIcon?: ReactNode;
  avatar?: ReactNode;

  tag?: ReactNode;
  badge?: ReactNode;
  rightIcon?: ReactNode;

  active?: boolean;
  onPress?: () => void;
};

export const Card = ({
  title,
  subtitle,
  caption,
  leftIcon,
  avatar,
  tag,
  badge,
  rightIcon,
  active,
  onPress,
}: CardProps) => {
  return (
    <Pressable
      onPress={onPress}
      className={twMerge(
        "flex-row rounded-2xl bg-white p-4 border border-transparent",
        active && "border border-accent",
      )}
    >
      {leftIcon && <View className="mr-3">{leftIcon}</View>}

      {avatar && <View className="mr-3">{avatar}</View>}

      <View className="flex-1">
        <View className="flex-row items-center gap-2">
          <Text className="font-inter-medium text-body">{title}</Text>
          {tag}
        </View>

        {subtitle && (
          <Text className="font-inter-medium text-caption text-gray mt-1">
            {subtitle}
          </Text>
        )}

        {caption && (
          <Text className="font-inter-regular text-gray-medium mt-1">
            {caption}
          </Text>
        )}
      </View>

      {rightIcon && (
        <View className="ml-3 flex-row items-center gap-2">{rightIcon}</View>
      )}
    </Pressable>
  );
};
