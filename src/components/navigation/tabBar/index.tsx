import React, { memo, useCallback } from "react";
import { Pressable, StyleSheet, useWindowDimensions, View } from "react-native";
import { router, useSegments, type Href } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import {
  Typography,
  StSvg,
  IconButton,
  FadeOverlay,
  GlassSurface,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { COMPACT_BREAKPOINT, TABS } from "@/src/constants/tabs";
import { useTabBarHeight } from "@/src/hooks/useTabBarHeight";
import { useHasUnreadChat } from "@/src/hooks/useHasUnreadChat";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setTabMenuOpen } from "@/src/store/redux/slices/uiSlice";
import ChatTabBarIcon from "@/src/components/navigation/tabBar/ChatTabBarIcon";

const hasGlassEffect = isLiquidGlassAvailable();

type Tab = (typeof TABS)[number];

type TabItemProps = {
  tab: Tab;
  isActive: boolean;
  isAtRoot: boolean;
  extendActive?: boolean;
  compact: boolean;
  showDot?: boolean;
  onPress: (key: string, isActive: boolean, isAtRoot: boolean) => void;
};

const TabItem = memo(
  ({
    tab,
    isActive,
    isAtRoot,
    extendActive,
    compact,
    showDot,
    onPress,
  }: TabItemProps) => {
    const handlePress = useCallback(() => {
      onPress(tab.key, isActive, isAtRoot);
    }, [onPress, tab.key, isActive, isAtRoot]);

    return (
      <Pressable
        onPress={handlePress}
        className={`flex-1 items-center justify-center rounded-full active:opacity-70 ${compact ? "h-[46px]" : "h-[58px] gap-0.5"}`}
      >
        {isActive && (
          <View
            className={`absolute inset-y-0 rounded-full ${!hasGlassEffect ? "bg-neutral-100" : "bg-neutral-100/50"}  ${extendActive ? "-inset-x-1" : "inset-x-0"}`}
          />
        )}
        <View className="relative">
          {showDot ? (
            <ChatTabBarIcon
              size={compact ? 24 : 32}
              color={isActive ? colors.neutral[900] : colors.neutral[500]}
            />
          ) : (
            <StSvg
              name={tab.icon as string}
              size={compact ? 24 : 32}
              color={isActive ? colors.neutral[900] : colors.neutral[500]}
            />
          )}
        </View>

        <Typography
          weight="semibold"
          className="text-[10px] leading-none text-center"
          style={isActive ? styles.labelActive : styles.labelInactive}
        >
          {tab.label}
        </Typography>
      </Pressable>
    );
  },
);
TabItem.displayName = "TabItem";

const getTabHref = (key: string): Href =>
  key === "index" ? "/(app)/(tabs)" : (`/(app)/(tabs)/${key}` as Href);

const StTabBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isMenuOpen = useAppSelector((s) => s.ui.isTabMenuOpen);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const tabBarHeight = useTabBarHeight();
  const hasUnreadChat = useHasUnreadChat();
  const segments = useSegments() as string[];

  const compact = width < COMPACT_BREAKPOINT;

  const isInTabs = segments[1] === "(tabs)";
  const activeRoute = isInTabs ? (segments[2] ?? "index") : undefined;
  const isActiveTabAtRoot = isInTabs && segments.length <= 3;

  const handleTabPress = useCallback(
    (key: string, isActive: boolean, isAtRoot: boolean) => {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      if (!isInTabs) {
        router.replace(getTabHref(key));
        return;
      }
      if (isActive && isAtRoot) return;
      router.navigate(getTabHref(key));
    },
    [isInTabs],
  );

  const handleMenuPress = useCallback(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    dispatch(setTabMenuOpen(!isMenuOpen));
  }, [dispatch, isMenuOpen]);

  return (
    <View
      style={[
        styles.container,
        {
          width: width,
          paddingLeft: insets.left,
          paddingRight: insets.right,
          paddingBottom: insets.bottom,
        },
      ]}
    >
      <FadeOverlay position="bottom" height={tabBarHeight + insets.bottom} />
      <View
        className="flex-row items-center justify-between px-screen bg-transparent"
        style={{ height: tabBarHeight }}
      >
        <View
          className="flex-1 rounded-full overflow-hidden mr-1.5 px-[3px]"
          style={styles.topShadow}
        >
          <GlassSurface
            style={StyleSheet.absoluteFill}
            fallbackClassName="bg-background-surface"
          />
          <View className="flex-1 flex-row items-center justify-between">
            {TABS.map((tab) => {
              const isActive = activeRoute === tab.key;
              return (
                <TabItem
                  key={tab.key}
                  tab={tab}
                  isActive={isActive}
                  isAtRoot={isActive ? isActiveTabAtRoot : true}
                  extendActive={tab.key === "calendar"}
                  compact={compact}
                  showDot={tab.key === "chat" && hasUnreadChat}
                  onPress={handleTabPress}
                />
              );
            })}
          </View>
        </View>
        <IconButton
          size={compact ? "lg" : "xxl"}
          style={styles.topShadow}
          icon={<StSvg name="Menu" size={28} color={colors.neutral[900]} />}
          onPress={handleMenuPress}
          buttonClassName={isMenuOpen ? "opacity-0" : undefined}
          disabled={isMenuOpen}
          glass
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
