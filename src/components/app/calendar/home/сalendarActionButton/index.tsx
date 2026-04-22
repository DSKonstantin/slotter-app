import React, { useCallback } from "react";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { Button, FloatingFooter, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

interface Props {
  mode?: string;
  title?: string;
  onPress: () => void;
}

const CalendarActionButton = ({ mode, title, onPress }: Props) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <FloatingFooter className="left-auto" offset={TAB_BAR_HEIGHT + 16}>
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
    </FloatingFooter>
  );
};

export default CalendarActionButton;
