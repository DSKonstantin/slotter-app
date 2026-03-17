import React, { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button, StModal, Typography } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  setFilters,
  type CalendarFilters,
} from "@/src/store/redux/slices/calendarSlice";
import FilterOption from "./filterOption";

const filterOptions: { label: string; key: keyof CalendarFilters }[] = [
  { label: "Подтвержденные", key: "showConfirmed" },
  { label: "Ожидающие подтверждения", key: "showPending" },
  { label: "Пришли", key: "showArrived" },
  { label: "Опоздали", key: "showLate" },
  { label: "Завершённые", key: "showCompleted" },
  { label: "Не явились", key: "showNoShow" },
  { label: "Отменённые", key: "showCancelled" },
];

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

  useEffect(() => {
    if (visible) setDraft(filters);
  }, [filters, visible]);

  const handleApply = useCallback(() => {
    dispatch(setFilters(draft));
    onClose();
  }, [dispatch, draft, onClose]);

  const toggleDraft = useCallback((key: keyof CalendarFilters) => {
    setDraft((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="gap-6">
        <Typography weight="semibold" className="text-display text-center">
          Фильтры
        </Typography>

        <View className="gap-2">
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

        <Button title="Применить" onPress={handleApply} />
      </View>
    </StModal>
  );
};

export default CalendarFilterModal;
