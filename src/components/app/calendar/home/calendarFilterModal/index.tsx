import React, { useCallback, useEffect, useRef, useState } from "react";
import { View } from "react-native";
import { Button, StModal, Typography } from "@/src/components/ui";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  setActiveStatuses,
  setFilterModalOpen,
} from "@/src/store/redux/slices/calendarSlice";
import type { AppointmentStatus } from "@/src/store/redux/services/api-types";
import { APPOINTMENT_STATUS_CONFIG } from "@/src/constants/appointmentStatuses";
import FilterOption from "./filterOption";

const filterOptions = Object.values(APPOINTMENT_STATUS_CONFIG).map(
  ({ status, filterLabel }) => ({ status, label: filterLabel }),
);

const CalendarFilterModal = () => {
  const [draft, setDraft] = useState<AppointmentStatus[]>([]);

  const pendingRef = useRef<AppointmentStatus[] | null>(null);

  const dispatch = useAppDispatch();
  const visible = useAppSelector((s) => s.calendar.isFilterModalOpen);
  const activeStatuses = useAppSelector((s) => s.calendar.activeStatuses);

  const handleClose = useCallback(() => {
    dispatch(setFilterModalOpen(false));
  }, [dispatch]);

  const handleApply = useCallback(() => {
    pendingRef.current = draft;
    dispatch(setFilterModalOpen(false));
  }, [dispatch, draft]);

  const handleModalHide = useCallback(() => {
    if (!pendingRef.current) return;
    dispatch(setActiveStatuses(pendingRef.current));
    pendingRef.current = null;
  }, [dispatch]);

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
      onClose={handleClose}
      onModalHide={handleModalHide}
      scrollable
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
    </StModal>
  );
};

export default CalendarFilterModal;
