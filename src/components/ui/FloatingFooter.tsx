import React, { ReactNode } from "react";
import { View, ViewProps } from "react-native";
import { twMerge } from "tailwind-merge";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const { bottom } = useSafeAreaInsets();

  return (
    <View
      {...props}
      className={twMerge("absolute left-0 right-0 z-[100]", className)}
      style={{
        bottom: bottom + offset,
        paddingLeft: 20,
        paddingRight: 20,
      }}
    >
      {children}
    </View>
  );
}
