import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { StModal, StSvg, Typography } from "@/src/components/ui";
import { ValueWheel } from "@/src/components/ui/pickers/ValueWheel";
import { colors } from "@/src/styles/colors";
import { INTERVAL_OPTIONS } from "./constants";

const WHEEL_DATA = INTERVAL_OPTIONS.map((value) => ({
  value,
  label: String(value),
}));

type IntervalPickerModalProps = {
  visible: boolean;
  value: number;
  onConfirm: (interval: number) => void;
  onClose: () => void;
};

const IntervalPickerModal = ({
  visible,
  value,
  onConfirm,
  onClose,
}: IntervalPickerModalProps) => {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      swipeDirection={undefined}
      headerLeft={{
        icon: <StSvg name="Arrow_left" size={24} color={colors.neutral[900]} />,
        onPress: onClose,
        accessibilityLabel: "Назад",
      }}
      headerRight={{
        icon: (
          <StSvg name="Done_round" size={24} color={colors.primary.blue[500]} />
        ),
        onPress: () => onConfirm(draft),
        accessibilityLabel: "Готово",
      }}
      header={
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 text-center mb-2"
        >
          Интервал сетки
        </Typography>
      }
    >
      <View className="flex-row items-center justify-center gap-4 mb-4">
        <ValueWheel
          data={WHEEL_DATA}
          value={draft}
          width={96}
          onChange={setDraft}
        />
        <Typography className="text-body text-neutral-900">мин</Typography>
      </View>
    </StModal>
  );
};

export default IntervalPickerModal;
