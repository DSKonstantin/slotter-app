import React from "react";
import { View, Text, Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

type ItemProps = {
  title: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
};

export function Item({ title, left, right, onPress, disabled }: ItemProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className={twMerge(
        "flex-row items-center rounded-2xl bg-white p-4 min-h-[60px] border border-background",
        disabled && "opacity-50",
      )}
    >
      {left && <View className="mr-2">{left}</View>}

      <View className="flex-1">
        <Text className="font-inter-regular text-body">{title}</Text>
      </View>

      {right && <View className="ml-2">{right}</View>}
    </Pressable>
  );
}
