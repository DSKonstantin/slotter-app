import React from "react";
import { Image, View, Text } from "react-native";
import { twMerge } from "tailwind-merge";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";

const SIZE_MAP = {
  xs: 34,
  sm: 40,
  md: 44,
  lg: 60,
  xl: 70,
} as const;

type AvatarProps = {
  uri?: string;
  name?: string;
  showPhotoIcon?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  fallbackIcon?: React.ReactNode;
};

export function Avatar({
  uri,
  name,
  size = "md",
  showPhotoIcon = false,
  fallbackIcon,
}: AvatarProps) {
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
      className={twMerge("relative items-center justify-center bg-neutral-100")}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: dimension,
            height: dimension,
            borderRadius: dimension / 2,
          }}
        />
      ) : initials ? (
        <Text className="font-inter-semibold text-neutral-500">{initials}</Text>
      ) : (
        fallbackIcon
      )}
      {showPhotoIcon && (
        <View className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-background-surface rounded-full p-0.5 items-center justify-center">
          <StSvg name="Camera" size={24} color={colors.neutral[900]} />
        </View>
      )}
    </View>
  );
}
