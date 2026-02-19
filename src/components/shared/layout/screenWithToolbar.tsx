import React, { ReactNode } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";

type ScreenWithToolbarProps = {
  title: string;
  rightButton?: ReactNode;
  children: ReactNode | ((ctx: { topInset: number }) => ReactNode);
  className?: string;
  style?: StyleProp<ViewStyle>;
};

const ScreenWithToolbar = ({
  title,
  rightButton,
  children,
  className = "flex-1",
  style,
}: ScreenWithToolbarProps) => {
  const { top } = useSafeAreaInsets();
  const topInset = TOOLBAR_HEIGHT + top;

  return (
    <View className="relative flex-1">
      <ToolbarTop title={title} rightButton={rightButton} />
      <View className={className} style={style}>
        {typeof children === "function" ? children({ topInset }) : children}
      </View>
    </View>
  );
};

export default ScreenWithToolbar;
