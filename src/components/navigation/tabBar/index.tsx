import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router, useSegments, type Href } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Typography, StSvg, FadeOverlay } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT, TABS } from "@/src/constants/tabs";

type Tab = (typeof TABS)[number];

type TabItemProps = {
  tab: Tab;
  isActive: boolean;
  isAtRoot: boolean;
  onPress: (key: string, isActive: boolean, isAtRoot: boolean) => void;
};

const TabItem = memo(({ tab, isActive, isAtRoot, onPress }: TabItemProps) => {
  const handlePress = useCallback(() => {
    onPress(tab.key, isActive, isAtRoot);
  }, [onPress, tab.key, isActive, isAtRoot]);

  return (
    <Pressable
      onPress={handlePress}
      className="flex-1 items-center justify-center h-[46px] rounded-full active:opacity-70"
    >
      {isActive && (
        <View className="absolute inset-y-0 inset-x-0 rounded-full bg-neutral-100" />
      )}
      <StSvg
        name={tab.icon as string}
        size={24}
        color={isActive ? colors.neutral[900] : colors.neutral[500]}
      />
      <Typography
        weight="semibold"
        className="text-[10px] leading-none text-center min-w-[64px] mt-[2px]"
        style={isActive ? styles.labelActive : styles.labelInactive}
      >
        {tab.label}
      </Typography>
    </Pressable>
  );
});
TabItem.displayName = "TabItem";

const getTabHref = (key: string): Href =>
  key === "index" ? "/(app)/(tabs)" : (`/(app)/(tabs)/${key}` as Href);

const StTabBar: React.FC = () => {
  const insets = useSafeAreaInsets();
  const segments = useSegments() as string[];

  const isInTabs = segments[1] === "(tabs)";
  const activeRoute = isInTabs ? (segments[2] ?? "index") : undefined;
  const isActiveTabAtRoot = isInTabs && segments.length <= 3;

  const handleTabPress = useCallback(
    (key: string, isActive: boolean, isAtRoot: boolean) => {
      if (!isInTabs) {
        router.replace(getTabHref(key));
        return;
      }
      if (isActive && isAtRoot) return;
      router.navigate(getTabHref(key));
    },
    [isInTabs],
  );

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
        className="flex-row items-center px-screen bg-transparent"
        style={{ height: TAB_BAR_HEIGHT }}
      >
        <View
          className="flex-1 bg-background-surface rounded-full flex-row items-center justify-between overflow-hidden border-4 border-background-surface"
          style={styles.topShadow}
        >
          {TABS.map((tab) => {
            const isActive = activeRoute === tab.key;
            return (
              <TabItem
                key={tab.key}
                tab={tab}
                isActive={isActive}
                isAtRoot={isActive ? isActiveTabAtRoot : true}
                onPress={handleTabPress}
              />
            );
          })}
        </View>
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
