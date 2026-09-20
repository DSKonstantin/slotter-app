import React, { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";
import { SCREEN_PADDING } from "@/src/constants/layout";

type FloatingFooterProps = {
  children: ReactNode;
  offset?: number;
  horizontalPadding?: number;
} & Omit<ViewProps, "style">;

export function FloatingFooter({
  children,
  offset = 16,
  horizontalPadding = SCREEN_PADDING,
  className,
  ...props
}: FloatingFooterProps) {
  return (
    <View
      {...props}
      className={twMerge("absolute left-0 right-0 z-[100]", className)}
      style={{
        bottom: offset,
        paddingLeft: horizontalPadding,
        paddingRight: horizontalPadding,
      }}
    >
      {children}
    </View>
  );
}
