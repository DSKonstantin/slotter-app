import React from "react";
import { View, Text, Pressable } from "react-native";
import { twMerge } from "tailwind-merge";

type ItemProps = {
  title: string;
  subtitle?: string;
  titleAccessory?: React.ReactNode;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  active?: boolean;
  className?: string;
  titleClassName?: string;
  contentClassName?: string;
};

export function Item({
  title,
  subtitle,
  titleAccessory,
  left,
  right,
  onPress,
  disabled,
  active,
  className,
  titleClassName,
  contentClassName,
}: ItemProps) {
  const Container = onPress ? Pressable : View;
  const containerProps = onPress
    ? {
        onPress,
        disabled,
      }
    : {};

  return (
    <Container
      {...containerProps}
      className={twMerge(
        "flex-row items-center rounded-2xl bg-white p-4 min-h-[60px] border border-background",
        onPress && "active:opacity-70",
        disabled && "opacity-50",
        className,
      )}
    >
      {left && <View className="mr-2">{left}</View>}

      <View
        className={twMerge(
          "flex-1 flex-row items-center gap-1.5",
          contentClassName,
        )}
      >
        <Text
          className={twMerge(
            active
              ? "font-inter-regular text-primary-blue-500 text-[16px]"
              : "font-inter-regular text-body",
            titleClassName,
          )}
        >
          {title}
        </Text>
        {titleAccessory}
        {subtitle && (
          <Text
            numberOfLines={1}
            className="font-inter-regular text-body text-neutral-400"
          >
            {subtitle}
          </Text>
        )}
      </View>

      {right && <View className="ml-2">{right}</View>}
    </Container>
  );
}
