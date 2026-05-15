import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import {
  Typography,
  StSvg,
  IconButton,
  FadeOverlay,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT, TABS } from "@/src/constants/tabs";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setTabMenuOpen } from "@/src/store/redux/slices/uiSlice";
import { CommonActions } from "@react-navigation/native";

type Tab = (typeof TABS)[number];

type TabItemProps = {
  tab: Tab;
  isActive: boolean;
  isAtRoot: boolean;
  extendActive?: boolean;
  onPress: (key: string, isActive: boolean, isAtRoot: boolean) => void;
};

const TabItem = memo(
  ({ tab, isActive, isAtRoot, extendActive, onPress }: TabItemProps) => {
    const handlePress = useCallback(() => {
      onPress(tab.key, isActive, isAtRoot);
    }, [onPress, tab.key, isActive, isAtRoot]);

    return (
      <Pressable
        onPress={handlePress}
        className="flex-1 items-center justify-center h-[46px] rounded-full active:opacity-70"
      >
        {isActive && (
          <View
            className={`absolute inset-y-0 rounded-full bg-neutral-100 ${extendActive ? "-inset-x-1" : "inset-x-0"}`}
          />
        )}
        <StSvg
          name={tab.icon as string}
          size={24}
          color={isActive ? colors.neutral[900] : colors.neutral[500]}
        />

        <Typography
          weight="semibold"
          className="text-[10px] leading-none text-center min-w-[64px]"
          style={isActive ? styles.labelActive : styles.labelInactive}
        >
          {tab.label}
        </Typography>
      </Pressable>
    );
  },
);
TabItem.displayName = "TabItem";

const StTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
  insets,
}) => {
  const dispatch = useAppDispatch();
  const isMenuOpen = useAppSelector((s) => s.ui.isTabMenuOpen);
  const activeRoute = state.routes[state.index]?.name;

  const handleTabPress = useCallback(
    (key: string, isActive: boolean, isAtRoot: boolean) => {
      if (key === "chat") {
        if (isActive && isAtRoot) return;
        navigation.dispatch(
          CommonActions.reset({ index: 0, routes: [{ name: key }] }),
        );
        return;
      }
      if (!isActive) {
        navigation.navigate(key);
        return;
      }
      if (isAtRoot) return;
      navigation.dispatch(
        CommonActions.reset({ index: 0, routes: [{ name: key }] }),
      );
    },
    [navigation],
  );

  const handleMenuPress = useCallback(() => {
    dispatch(setTabMenuOpen(!isMenuOpen));
  }, [dispatch, isMenuOpen]);

  return (
    <View
      style={[
        styles.container,
        {
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FadeOverlay position="bottom" height={TAB_BAR_HEIGHT + insets.bottom} />
      <View
        className="flex-row items-center justify-between px-screen bg-transparent"
        style={{
          height: TAB_BAR_HEIGHT,
        }}
      >
        <View
          className="flex-1 mr-1.5 bg-background-surface rounded-full flex-row items-center justify-between overflow-hidden border-4 border-background-surface"
          style={styles.topShadow}
        >
          {TABS.map((tab) => {
            const tabRoute = state.routes.find((r) => r.name === tab.key);
            const isAtRoot =
              !tabRoute?.state || (tabRoute.state.index ?? 0) === 0;

            return (
              <TabItem
                key={tab.key}
                tab={tab}
                isActive={activeRoute === tab.key}
                isAtRoot={isAtRoot}
                extendActive={tab.key === "calendar"}
                onPress={handleTabPress}
              />
            );
          })}
        </View>
        <IconButton
          size="lg"
          style={styles.topShadow}
          icon={<StSvg name="Menu" size={24} color={colors.neutral[900]} />}
          onPress={handleMenuPress}
          buttonClassName={isMenuOpen ? "opacity-0" : undefined}
          disabled={isMenuOpen}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "transparent",
  },
  topShadow: {
    boxShadow: "0px -4px 12px rgba(0, 0, 0, 0.08)",
  },
  labelActive: { color: colors.neutral[900] },
  labelInactive: { color: colors.neutral[500] },
});

export default StTabBar;
