import React, { memo } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "@/src/styles/colors";

type CurrentTimeIndicatorProps = {
  top: number;
  time: string;
};

const BADGE_HEIGHT = 28;

const CurrentTimeIndicator = ({ top, time }: CurrentTimeIndicatorProps) => {
  return (
    <View
      pointerEvents="none"
      className="absolute left-[10px] right-0 z-[100] flex-row items-center"
      style={{
        top: top - BADGE_HEIGHT / 2,
      }}
    >
      <View className="w-[50px] items-center">
        <View
          className="w-[52px] h-[28px] justify-center items-center bg-neutral-900"
          style={styles.badge}
        >
          <Text className="text-caption font-semibold text-neutral-0">
            {time}
          </Text>
        </View>
      </View>
      <View className="flex-1 h-[2px] bg-neutral-900 mr-screen" />
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    borderRadius: 9999,
  },
});

export default memo(CurrentTimeIndicator);
