import React from "react";
import { Pressable, View } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Typography, StSvg, IconButton } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { LinearGradient } from "expo-linear-gradient";
import { TAB_BAR_HEIGHT, TABS } from "@/src/constants/tabs";

const StTabBar: React.FC<BottomTabBarProps> = ({
  state,
  navigation,
  insets,
}) => {
  const activeRoute = state.routes[state.index]?.name;

  return (
    <View
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        height: TAB_BAR_HEIGHT + insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
        paddingBottom: insets.bottom,
        backgroundColor: "transparent",
      }}
    >
      <LinearGradient
        colors={["#F2F2F6", "rgba(242, 242, 246, 0)"]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: TAB_BAR_HEIGHT + insets.bottom + 8,
        }}
        pointerEvents="none"
      />
      <View className="flex-row items-center justify-between px-5 bg-transparent">
        <View className="flex-1 mr-3 bg-background-surface rounded-full flex-row items-center justify-between p-1">
          {TABS.map((tab) => {
            const isActive = activeRoute === tab.key;

            return (
              <Pressable
                key={tab.key}
                onPress={() => navigation.navigate(tab.key)}
                className={`flex-1 px-2 py-1.5 items-center justify-center
                h-[58px] gap-0.5
                rounded-full ${isActive ? "bg-neutral-100" : "transparent"}`}
              >
                <StSvg
                  name={tab.icon as any}
                  size={32}
                  color={isActive ? colors.neutral[900] : colors.neutral[500]}
                />

                <Typography
                  weight={isActive ? "semibold" : "medium"}
                  className="text-[10px] leading-none"
                  style={{
                    color: isActive ? colors.neutral[900] : colors.neutral[500],
                  }}
                >
                  {tab.label}
                </Typography>
              </Pressable>
            );
          })}
        </View>
        <IconButton
          size="lg"
          icon={
            <StSvg
              name="Add_round"
              size={36}
              color={colors.primary.blue[500]}
            />
          }
          onPress={() => {}}
        />
      </View>
    </View>
  );
};

export default StTabBar;
