import React, { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";
import { SCREEN_PADDING } from "@/src/constants/layout";

type FloatingFooterProps = {
  children: ReactNode;
  offset?: number;
} & Omit<ViewProps, "style">;

export function FloatingFooter({
  children,
  offset = 16,
  className,
  ...props
}: FloatingFooterProps) {
  return (
    <View
      {...props}
      className={twMerge("absolute left-0 right-0 z-[100]", className)}
      style={{
        bottom: offset,
        paddingLeft: SCREEN_PADDING,
        paddingRight: SCREEN_PADDING,
      }}
    >
      {children}
    </View>
  );
}
