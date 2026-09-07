import React, { memo, useCallback, useMemo } from "react";
import { buildMinuteOptions } from "@/src/utils/date/timeOptions";
import { TimeWheelPickerModal } from "@/src/components/ui/pickers/TimeWheelPickerModal";

export type FreeSlotRange = {
  start: number;
  end: number;
};

type FreeSlotStartModalProps = {
  visible: boolean;
  range: FreeSlotRange | null;
  onClose: () => void;
  onNext?: (start: number) => void;
};

const STEP_MINUTES = 15;
// The free gap itself can extend for hours (all the way to the next
// appointment or end of day), but scrolling through that whole window just
// to pick a start time near where the user tapped is impractical — cap the
// picker to a 1-hour window from the tapped point.
const MAX_RANGE_MINUTES = 60;

const FreeSlotStartModal = ({
  visible,
  range,
  onClose,
  onNext,
}: FreeSlotStartModalProps) => {
  const options = useMemo(() => {
    if (!range) return [];
    const end = Math.min(
      Math.max(range.start, range.end),
      range.start + MAX_RANGE_MINUTES,
    );
    return buildMinuteOptions({
      start: range.start,
      end,
      step: STEP_MINUTES,
    });
  }, [range]);

  const handleConfirm = useCallback(
    (minutes: number) => {
      onNext?.(minutes);
      onClose();
    },
    [onClose, onNext],
  );

  return (
    <TimeWheelPickerModal
      visible={visible}
      options={options}
      value={options[0]}
      title="Выбрать начало слота"
      confirmLabel="Далее"
      cancelLabel={null}
      onConfirm={handleConfirm}
      onClose={onClose}
    />
  );
};

export default memo(FreeSlotStartModal);
