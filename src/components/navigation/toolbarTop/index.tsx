import React from "react";

import { View } from "react-native";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

type ToolbarTopProps = {
  title: string;
  showBack?: boolean;
  rightButton?: React.ReactNode;
};

const ToolbarTop = ({
  title,
  showBack = true,
  rightButton,
}: ToolbarTopProps) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View
      pointerEvents="box-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        paddingTop: insets.top,
        height: TOOLBAR_HEIGHT + insets.top,
        backgroundColor: "transparent",
      }}
    >
      <LinearGradient
        colors={["#F2F2F6", "rgba(242, 242, 246, 0)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: TOOLBAR_HEIGHT + insets.top + 8,
        }}
        pointerEvents="none"
      />
      <View
        className="mx-screen flex-row  items-center justify-between"
        style={{
          paddingLeft: insets.left,
          paddingRight: insets.right,
        }}
      >
        {showBack ? (
          <IconButton
            icon={
              <StSvg name="Arrow_left" size={24} color={colors.neutral[900]} />
            }
            onPress={() => router.back()}
          />
        ) : (
          <View className="w-[48px]" />
        )}

        <View className="rounded-full h-[48px] px-5 items-center justify-center bg-background-surface">
          <Typography weight="semibold" className="text-[17px] leading-[22px]">
            {title}
          </Typography>
        </View>

        {rightButton ? rightButton : <View className="w-[48px]" />}
      </View>
    </View>
  );
};

export default ToolbarTop;
