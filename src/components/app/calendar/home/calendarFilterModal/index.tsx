import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, StModal, Typography } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setActiveStatuses } from "@/src/store/redux/slices/calendarSlice";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";
import FilterOption from "./filterOption";

const filterOptions = Object.values(APPOINTMENT_STATUS_CONFIG).map(
  ({ status, filterLabel }) => ({ status, label: filterLabel }),
);

type CalendarFilterModalProps = {
  visible: boolean;
  onClose: () => void;
};

const CalendarFilterModal: React.FC<CalendarFilterModalProps> = ({
  visible,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const activeStatuses = useAppSelector((s) => s.calendar.activeStatuses);
  const [draft, setDraft] = useState<AppointmentStatus[]>(activeStatuses);

  const handleApply = useCallback(() => {
    dispatch(setActiveStatuses(draft));
    onClose();
  }, [dispatch, draft, onClose]);

  const toggleDraft = useCallback((status: AppointmentStatus) => {
    setDraft((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status],
    );
  }, []);

  useEffect(() => {
    if (visible) setDraft(activeStatuses);
  }, [activeStatuses, visible]);

  return (
    <StModal
      header={
        <Typography weight="semibold" className="text-display text-center mb-3">
          Фильтры
        </Typography>
      }
      footer={<Button title="Применить" onPress={handleApply} />}
      visible={visible}
      onClose={onClose}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{ flexShrink: 1 }}
      >
        <View className="gap-2 mb-4">
          <Typography className="text-caption text-neutral-500">
            Показывать:
          </Typography>
          {filterOptions.map(({ status, label }) => (
            <FilterOption
              key={status}
              label={label}
              value={draft.includes(status)}
              onPress={() => toggleDraft(status)}
            />
          ))}
        </View>
      </ScrollView>
    </StModal>
  );
};

export default CalendarFilterModal;
