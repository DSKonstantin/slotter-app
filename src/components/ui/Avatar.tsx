import React from "react";
import { Image, View, Text } from "react-native";
import { twMerge } from "tailwind-merge";

const SIZE_MAP = {
  xs: 34,
  sm: 40,
  md: 50,
  lg: 70,
  xl: 100,
} as const;

type AvatarProps = {
  uri?: string;
  name?: string;
  size?: "sm" | "md" | "lg" | "xl";
  fallbackIcon?: React.ReactNode;
};

export function Avatar({ uri, name, size = "md", fallbackIcon }: AvatarProps) {
  const dimension = SIZE_MAP[size];

  const initials =
    name
      ?.split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "";

  return (
    <View
      style={{
        width: dimension,
        height: dimension,
        borderRadius: dimension / 2,
      }}
      className={twMerge(
        "items-center justify-center bg-gray-lighter overflow-hidden",
      )}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{ width: dimension, height: dimension }}
        />
      ) : initials ? (
        <Text className="font-inter-semibold text-gray">{initials}</Text>
      ) : (
        fallbackIcon
      )}
    </View>
  );
}
