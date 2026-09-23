import React, {
  ReactNode,
  cloneElement,
  isValidElement,
  useContext,
  useMemo,
} from "react";
import { StyleProp, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import { IconButton } from "@/src/components/ui";
import { TOOLBAR_HEIGHT, TAB_BAR_BOTTOM_GAP } from "@/src/constants/tabs";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import {
  ToolbarContext,
  ToolbarContextValue,
  ToolbarProvider,
} from "@/src/components/shared/layout/toolbarContext";
import { Href } from "expo-router";

export type RightButtonProp =
  ReactNode | ((toolbar: ToolbarContextValue | null) => ReactNode);

type ScreenWithToolbarProps = {
  title: string | React.ReactNode;
  rightButton?: RightButtonProp;
  fallbackHref?: Href;
  showBack?: boolean;
  children:
    ReactNode | ((ctx: { topInset: number; bottomInset: number }) => ReactNode);
  className?: string;
  style?: StyleProp<ViewStyle>;
};

function withGlass(node: ReactNode): ReactNode {
  if (isValidElement(node) && node.type === IconButton) {
    return cloneElement(node as React.ReactElement<{ glass?: boolean }>, {
      glass: (node.props as { glass?: boolean }).glass ?? true,
    });
  }
  return node;
}

function RightButtonSlot({ rightButton }: { rightButton?: RightButtonProp }) {
  const toolbar = useContext(ToolbarContext);
  const node =
    typeof rightButton === "function" ? rightButton(toolbar) : rightButton;
  return <>{withGlass(node)}</>;
}

const ScreenWithToolbar = ({
  title,
  rightButton,
  fallbackHref,
  showBack = true,
  children,
  className = "flex-1",
  style,
}: ScreenWithToolbarProps) => {
  const { top, bottom } = useSafeAreaInsets();
  const tabBarHeight = useTabBarHeight();

  const insets = useMemo(
    () => ({
      topInset: TOOLBAR_HEIGHT + top,
      bottomInset: tabBarHeight + bottom + TAB_BAR_BOTTOM_GAP,
    }),
    [top, bottom, tabBarHeight],
  );

  return (
    <ToolbarProvider>
      <View className="relative flex-1">
        <ToolbarTop
          title={title}
          showBack={showBack}
          fallbackHref={fallbackHref}
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
