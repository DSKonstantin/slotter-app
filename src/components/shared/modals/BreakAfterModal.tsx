import React from "react";
import { TimeWheelPickerModal } from "@/src/components/ui/pickers/TimeWheelPickerModal";
import { BREAK_AFTER_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";

interface Props {
  visible: boolean;
  currentMinutes: number;
  onClose: () => void;
  onSelect: (minutes: number) => void;
}

const BreakAfterModal: React.FC<Props> = ({
  visible,
  currentMinutes,
  onClose,
  onSelect,
}) => (
  <TimeWheelPickerModal
    visible={visible}
    options={BREAK_AFTER_MINUTE_OPTIONS}
    value={currentMinutes}
    title="Перерыв после записи"
    onConfirm={onSelect}
    onClose={onClose}
  />
);

export default BreakAfterModal;
