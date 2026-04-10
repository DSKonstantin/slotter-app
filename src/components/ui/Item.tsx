import React from "react";
import { View, Text, Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

type ItemProps = {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  titleClassName?: string;
};

export function Item({
  title,
  subtitle,
  left,
  right,
  onPress,
  disabled,
  active,
  className,
  titleClassName,
}: ItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={twMerge(
        "flex-row items-center rounded-2xl bg-white p-4 min-h-[60px] border border-background active:opacity-70",
        disabled && "opacity-50",
        className,
      )}
    >
      {left && <View className="mr-2">{left}</View>}

      <View className="flex-1 flex-row items-center gap-1.5">
        <Text
          className={twMerge(
            "font-inter-regular text-body",
            active && "font-inter-semibold text-body text-primary-blue-500",
            titleClassName,
          )}
        >
          {title}
        </Text>
        {subtitle && (
          <Text className="font-inter-regular text-body text-neutral-400">
            {subtitle}
          </Text>
        )}
      </View>

      {right && <View className="ml-2">{right}</View>}
    </Pressable>
  );
}
