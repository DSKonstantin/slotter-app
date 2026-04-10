import React, { ReactNode, useContext, useMemo } from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import {
  ToolbarContext,
  ToolbarContextValue,
  ToolbarProvider,
} from "@/src/components/shared/layout/toolbarContext";

export type RightButtonProp =
  | ReactNode
  | ((toolbar: ToolbarContextValue | null) => ReactNode);

type ScreenWithToolbarProps = {
  title: string;
  rightButton?: RightButtonProp;
  children:
    | ReactNode
    | ((ctx: { topInset: number; bottomInset: number }) => ReactNode);
  className?: string;
  style?: StyleProp<ViewStyle>;
};

function RightButtonSlot({ rightButton }: { rightButton?: RightButtonProp }) {
  const toolbar = useContext(ToolbarContext);
  if (typeof rightButton === "function") return <>{rightButton(toolbar)}</>;
  return <>{rightButton}</>;
}

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
    <ToolbarProvider>
      <View className="relative flex-1">
        <ToolbarTop
          title={title}
          rightButton={
            rightButton ? (
              <RightButtonSlot rightButton={rightButton} />
            ) : undefined
          }
        />
        <View className={className} style={style}>
          {typeof children === "function" ? children(insets) : children}
        </View>
      </View>
    </ToolbarProvider>
  );
};

export default ScreenWithToolbar;
