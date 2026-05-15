import React, { memo } from "react";
import { Text, View } from "react-native";

type CurrentTimeIndicatorProps = {
  top: number;
  time: string;
};

const CurrentTimeIndicator = ({ top, time }: CurrentTimeIndicatorProps) => {
  return (
    <View
      pointerEvents="none"
      className="absolute left-[10px] right-0 z-[100] flex-row items-center"
      style={{
        top,
      }}
    >
      <View className="w-[50px] items-center">
        <View className="w-[52px] h-[28px] rounded-full bg-[#D9D9D9] justify-center items-center">
          <Text className="text-[12px] font-semibold text-neutral-900">
            {time}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(CurrentTimeIndicator);
