import React, { useCallback } from "react";
import { View } from "react-native";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { Button, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface Props {
  mode?: string;
  title?: string;
  onPress: () => void;
}

const CalendarActionButton = ({ mode, title, onPress }: Props) => {
  const { bottom, left, right } = useSafeAreaInsets();

  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <View
      className="absolute"
      style={{
        zIndex: 100,
        bottom: TAB_BAR_HEIGHT + bottom + 16,
        right: 0,
        paddingRight: right + 20,
        paddingLeft: left + 20,
      }}
    >
      <Button
        onPress={handlePress}
        title={
          title ??
          (mode === "month" ? "Настроить расписание" : "Настроить день")
        }
        rightIcon={
          <StSvg name="Edit_fill" size={24} color={colors.neutral[0]} />
        }
      />
    </View>
  );
};

export default CalendarActionButton;
