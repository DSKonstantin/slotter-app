import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, View } from "react-native";
import { Button, StModal, Typography } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  setFilters,
  type CalendarFilters,
} from "@/src/store/redux/slices/calendarSlice";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";
import FilterOption from "./filterOption";

const filterOptions = Object.values(APPOINTMENT_STATUS_CONFIG).map(
  ({ filterLabel, filterKey }) => ({ label: filterLabel, key: filterKey }),
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
  const filters = useAppSelector((state) => state.calendar.filters);
  const [draft, setDraft] = useState<CalendarFilters>(filters);

  const handleApply = useCallback(() => {
    dispatch(setFilters(draft));
    onClose();
  }, [dispatch, draft, onClose]);

  const toggleDraft = useCallback((key: keyof CalendarFilters) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

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
          {filterOptions.map(({ label, key }) => (
            <FilterOption
              key={key}
              label={label}
              value={draft[key]}
              onPress={() => toggleDraft(key)}
            />
          ))}
        </View>
      </ScrollView>
    </StModal>
  );
};

export default CalendarFilterModal;
