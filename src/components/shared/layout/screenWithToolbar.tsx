import React, { ReactNode, useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";

type ScreenWithToolbarProps = {
  title: string;
  rightButton?: ReactNode;
  children:
    | ReactNode
    | ((ctx: { topInset: number; bottomInset: number }) => ReactNode);
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
  const { top, bottom } = useSafeAreaInsets();

  const insets = useMemo(
    () => ({
      topInset: TOOLBAR_HEIGHT + top,
      bottomInset: TAB_BAR_HEIGHT + bottom,
    }),
    [top, bottom],
  );

  return (
    <View className="relative flex-1">
      <ToolbarTop title={title} rightButton={rightButton} />
      <View className={className} style={style}>
        {typeof children === "function" ? children(insets) : children}
      </View>
    </View>
  );
};

export default ScreenWithToolbar;
