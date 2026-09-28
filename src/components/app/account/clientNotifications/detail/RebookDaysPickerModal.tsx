import React, { useEffect, useMemo, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Button, StModal, Typography } from "@/src/components/ui";
import { ValueWheel } from "@/src/components/ui/pickers/ValueWheel";
import { pluralize } from "@/src/utils/text/pluralize";

const MIN_DAYS = 1;
const MAX_DAYS = 365;

const DAY_OPTIONS = Array.from({ length: MAX_DAYS - MIN_DAYS + 1 }, (_, i) => {
  const value = MIN_DAYS + i;
  return {
    value,
    label: `${value} ${pluralize(value, ["день", "дня", "дней"])}`,
  };
});

type RebookDaysPickerModalProps = {
  visible: boolean;
  value: number;
  onConfirm: (days: number) => void;
  onClose: () => void;
};

const RebookDaysPickerModal = ({
  visible,
  value,
  onConfirm,
  onClose,
}: RebookDaysPickerModalProps) => {
  const [draft, setDraft] = useState(value);
  const wasVisible = useRef(visible);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (justOpened) setDraft(value);
  }, [visible, value]);

  const { width: screenWidth } = useWindowDimensions();
  const pickerWidth = useMemo(
    () => Math.min(320, screenWidth - 64),
    [screenWidth],
  );

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      swipeDirection={undefined}
      headerCloseButton
      header={
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 text-center mb-4"
        >
          Выберите продолжительность
        </Typography>
      }
      footer={
        <View className="gap-3">
          <Button title="Готово" onPress={() => onConfirm(draft)} />
          <Button title="Отмена" variant="clear" onPress={onClose} />
        </View>
      }
    >
      <View className="mb-4 items-center">
        <ValueWheel
          data={DAY_OPTIONS}
          value={draft}
          width={pickerWidth}
          onChange={setDraft}
        />
      </View>
    </StModal>
  );
};

export default RebookDaysPickerModal;
