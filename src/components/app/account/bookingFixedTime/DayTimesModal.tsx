import React, { useEffect, useState } from "react";
import { StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import ChipGrid from "./ChipGrid";

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
        icon: <StSvg name="Arrow_left" size={24} color={colors.neutral[900]} />,
        onPress: onClose,
        accessibilityLabel: "Назад",
      }}
      headerRight={{
        icon: (
          <StSvg name="Done_round" size={24} color={colors.primary.blue[500]} />
        ),
        onPress: () => onConfirm([...draft].sort((a, b) => a - b)),
        accessibilityLabel: "Готово",
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
        chipClassName="rounded-full"
        onToggle={handleToggle}
      />
    </StModal>
  );
};

export default DayTimesModal;
