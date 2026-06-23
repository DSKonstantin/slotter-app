import React, { memo, useCallback } from "react";
import { Pressable } from "react-native";

type FreeSlotPressableProps = {
  start: number;
  end: number;
  onPress: (start: number, end: number) => void;
};

const FreeSlotPressable = ({ start, end, onPress }: FreeSlotPressableProps) => {
  const handlePress = useCallback(() => {
    onPress(start, end);
  }, [end, onPress, start]);

  return <Pressable className="flex-1 min-h-[78px]" onPress={handlePress} />;
};

export default memo(FreeSlotPressable);
