import React from "react";
import { View } from "react-native";
import { Card, StModal, Typography } from "@/src/components/ui";
import { pluralize } from "@/src/utils/text/pluralize";

type RebookDaysModalProps = {
  visible: boolean;
  options: number[];
  current?: number;
  onClose: () => void;
  onSelect: (days: number) => void;
};

const RebookDaysModal = ({
  visible,
  options,
  current,
  onClose,
  onSelect,
}: RebookDaysModalProps) => (
  <StModal
    visible={visible}
    onClose={onClose}
    headerCloseButton
    scrollable
    header={
      <Typography weight="semibold" className="text-display text-center mb-4">
        Выберите продолжительность
      </Typography>
    }
  >
    <View className="gap-2">
      {options.map((days) => (
        <Card
          key={days}
          title={`${days} ${pluralize(days, ["день", "дня", "дней"])}`}
          active={days === current}
          onPress={() => onSelect(days)}
        />
      ))}
    </View>
  </StModal>
);

export default RebookDaysModal;
