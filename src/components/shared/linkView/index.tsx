import React from "react";
import { Pressable } from "react-native";
import { twMerge } from "tailwind-merge";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type Props = {
  link: string;
  displayLink?: string;
  className?: string;
  textClassName?: string;
  iconName?: string;
  iconColor?: string;
  iconSize?: number;
  onPress?: () => void;
};

export const LinkView = ({
  link,
  displayLink,
  className,
  textClassName,
  iconName = "Copy_alt",
  iconColor = colors.primary.blue[500],
  iconSize = 24,
  onPress,
}: Props) => {
  return (
    <Pressable
      onPress={onPress}
      className={twMerge(
        "flex-row justify-center items-center bg-background-surface w-full rounded-2xl p-4 border border-dashed border-neutral-500 gap-1.5",
        onPress && "active:opacity-70",
        className,
      )}
    >
      <Typography
        weight="semibold"
        className={twMerge("text-body text-primary-blue-500", textClassName)}
      >
        {displayLink ?? link}
      </Typography>
      <StSvg name={iconName} size={iconSize} color={iconColor} />
    </Pressable>
  );
};
