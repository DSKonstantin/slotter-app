import React, { useCallback } from "react";
import { Button, FloatingFooter, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

interface Props {
  mode?: string;
  title?: string;
  onPress: () => void;
  bottomInset: number;
}

const CalendarActionButton = ({ mode, title, onPress, bottomInset }: Props) => {
  const handlePress = useCallback(() => {
    onPress();
  }, [onPress]);

  return (
    <FloatingFooter className="left-auto" offset={bottomInset + 8}>
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
