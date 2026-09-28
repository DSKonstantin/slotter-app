import React, { useEffect, useState } from "react";
import { StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ChipGrid from "./ChipGrid";
import {
  MODAL_BACK_BUTTON_CLASS,
  MODAL_CONFIRM_BUTTON_CLASS,
} from "./constants";

type DayTimesModalProps = {
  visible: boolean;
  title: string;
  items: { value: number; label: string }[];
  value: number[];
  onConfirm: (times: number[]) => void;
  onClose: () => void;
};

const DayTimesModal = ({
  visible,
  title,
  items,
  value,
  onConfirm,
  onClose,
}: DayTimesModalProps) => {
  const [draft, setDraft] = useState(value);

  const handleToggle = (time: number) =>
    setDraft((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time],
    );

  useEffect(() => {
    if (visible) setDraft(value);
  }, [visible, value]);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      scrollable
      headerLeft={{
        icon: (
          <StSvg name="Expand_left" size={24} color={colors.neutral[900]} />
        ),
        onPress: onClose,
        accessibilityLabel: "Назад",
        buttonClassName: MODAL_BACK_BUTTON_CLASS,
      }}
      headerRight={{
        icon: <StSvg name="Done_round" size={24} color={colors.neutral[0]} />,
        onPress: () => onConfirm([...draft].sort((a, b) => a - b)),
        accessibilityLabel: "Готово",
        buttonClassName: MODAL_CONFIRM_BUTTON_CLASS,
      }}
      header={
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 text-center mb-2"
        >
          {title}
        </Typography>
      }
    >
      <Typography className="text-caption text-neutral-500 mb-2">
        Выберите время
      </Typography>
      <ChipGrid
        items={items}
        selected={draft}
        columns={4}
        onToggle={handleToggle}
      />
    </StModal>
  );
};

export default DayTimesModal;
