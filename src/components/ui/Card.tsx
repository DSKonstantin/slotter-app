import React, { ReactNode } from "react";
import { Pressable, View, Text, TextProps } from "react-native";
import { twMerge } from "tailwind-merge";

type CardProps = {
  title: string;
  titleProps?: TextProps;
  subtitle?: string;
  caption?: string;

  left?: ReactNode;
  right?: ReactNode;
  titleAccessory?: ReactNode;

  active?: boolean;
  onPress?: () => void;
  pressArea?: "card" | "content";
  className?: string;
};

export const Card = ({
  title,
  titleProps,
  subtitle,
  caption,
  left,
  right,
  titleAccessory,
  active,
  onPress,
  pressArea = "card",
  className,
}: CardProps) => {
  const isPressable = Boolean(onPress);
  const pressCard = isPressable && pressArea === "card";
  const pressContent = isPressable && pressArea === "content";
  const CardRootComponent = pressCard ? Pressable : View;
  const ContentComponent = pressContent ? Pressable : View;

  return (
    <CardRootComponent
      {...(pressCard ? { onPress } : {})}
      className={twMerge(
        "flex-row items-center rounded-base bg-background-surface p-4 border border-transparent",
        active && "border-neutral-200",
        className,
      )}
    >
      {left ? <View className="mr-3">{left}</View> : null}

      <ContentComponent
        className="flex-1"
        {...(pressContent ? { onPress } : {})}
      >
        <View className="flex-row items-center gap-2">
          <Text
            {...titleProps}
            className={`font-inter-medium text-body ${active ? "text-primary-blue-500" : "text-neutral-900"}`}
          >
            {title}
          </Text>
          {titleAccessory}
        </View>

        {subtitle && (
          <Text
            className={"font-inter-medium text-caption text-neutral-500 mt-1"}
          >
            {subtitle}
          </Text>
        )}

        {caption && (
          <Text className="font-inter-regular text-gray-medium mt-1">
            {caption}
          </Text>
        )}
      </ContentComponent>

      {right ? (
        <View className="ml-3 flex-row items-center gap-2">{right}</View>
      ) : null}
    </CardRootComponent>
  );
};
