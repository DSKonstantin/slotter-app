import React from "react";
import { View } from "react-native";
import { Button, FloatingFooter, StSvg } from "@/src/components/ui";
import type { CustomBtn } from "@/src/components/ui/Button";
import { colors } from "@/src/styles/colors";

interface ButtonConfig extends Omit<CustomBtn, "title" | "onPress"> {
  icon?: string;
  onPress: () => void;
  title?: string;
  show?: boolean;
}

interface Props {
  buttons: ButtonConfig[];
  bottomInset: number;
}

const CalendarActionButton = ({ buttons, bottomInset }: Props) => {
  return (
    <FloatingFooter className="left-auto" offset={bottomInset + 8}>
      <View className="flex-row gap-2">
        {buttons
          .filter((btn) => btn.show !== false)
          .map((btn, idx) => {
            const { icon, onPress, title, show, ...buttonProps } = btn;
            return (
              <Button
                key={idx}
                onPress={onPress}
                title={title}
                rightIcon={
                  icon ? (
                    <StSvg name={icon} size={24} color={colors.neutral[0]} />
                  ) : undefined
                }
                {...buttonProps}
              />
            );
          })}
      </View>
    </FloatingFooter>
  );
};

export default CalendarActionButton;
