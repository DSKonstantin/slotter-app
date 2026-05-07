import React from "react";
import { View } from "react-native";
import { StModal, Button, Typography } from "@/src/components/ui";

type Props = {
  visible: boolean;
  hour: string | null;
  slots: string[];
  selectedTime: string;
  onSelect: (slot: string) => void;
  onClose: () => void;
};

const HourPickerModal = ({
  visible,
  hour,
  slots,
  selectedTime,
  onSelect,
  onClose,
}: Props) => (
  <StModal visible={visible} onClose={onClose}>
    <View className="gap-4">
      <Typography weight="semibold" className="text-display text-center">
        {hour ? `${hour}:00` : ""}
      </Typography>
      <View className="flex-row flex-wrap gap-2 justify-center">
        {slots.map((slot) => {
          const isSelected = selectedTime === slot;
          return (
            <Button
              key={slot}
              title={slot}
              variant={isSelected ? "accent" : "secondary"}
              buttonClassName="rounded-small px-3"
              onPress={() => onSelect(slot)}
            />
          );
        })}
      </View>
    </View>
  </StModal>
);

export default HourPickerModal;
