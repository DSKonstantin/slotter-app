import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";

import { StModal, Typography, Button, Input, StSvg } from "@/src/components/ui";
import { TimeWheelField } from "@/src/components/ui/fields/TimeWheelField";
import { colors } from "@/src/styles/colors";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";
import { parseTime, formatTime } from "./utils";
import { getApiErrorMessage } from "@/src/utils/apiError";
import {
  useUpdateWorkingDayBreakMutation,
  useDeleteWorkingDayBreakMutation,
} from "@/src/store/redux/services/api/workingDaysApi";
import type { WorkingDayBreak } from "@/src/store/redux/services/api-types";

type Props = {
  visible: boolean;
  breakItem: WorkingDayBreak | null;
  workingDayId?: number;
  onClose: () => void;
};

const clockAdornment = (
  <StSvg name="Time" size={24} color={colors.neutral[500]} />
);

const EditBreakModal = ({
  visible,
  breakItem,
  workingDayId,
  onClose,
}: Props) => {
  const [name, setName] = useState("");
  const [start, setStart] = useState<number | null>(null);
  const [end, setEnd] = useState<number | null>(null);

  const [updateWorkingDayBreak, { isLoading: isSaving }] =
    useUpdateWorkingDayBreakMutation();
  const [deleteWorkingDayBreak, { isLoading: isDeleting }] =
    useDeleteWorkingDayBreakMutation();

  const wasVisible = useRef(visible);
  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!justOpened || !breakItem) return;
    setName(breakItem.name ?? "");
    setStart(parseTime(breakItem.start_at));
    setEnd(parseTime(breakItem.end_at));
  }, [visible, breakItem]);

  const startOptions =
    end == null
      ? FULL_DAY_MINUTE_OPTIONS.slice(0, -1)
      : FULL_DAY_MINUTE_OPTIONS.filter((o) => o < end);
  const endOptions =
    start == null
      ? FULL_DAY_MINUTE_OPTIONS.slice(1)
      : FULL_DAY_MINUTE_OPTIONS.filter((o) => o > start);

  const handleSave = useCallback(async () => {
    if (!breakItem || !workingDayId || start == null || end == null) return;

    try {
      await updateWorkingDayBreak({
        workingDayId,
        id: breakItem.id,
        data: {
          start_at: formatTime(start),
          end_at: formatTime(end),
          name: name || undefined,
        },
      }).unwrap();
      toast.success("Сохранено");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить перерыв"));
    }
  }, [
    breakItem,
    workingDayId,
    start,
    end,
    name,
    updateWorkingDayBreak,
    onClose,
  ]);

  const handleDelete = useCallback(() => {
    if (!breakItem || !workingDayId) return;

    Alert.alert("Удалить перерыв?", "Это действие нельзя отменить", [
      { text: "Отмена", style: "cancel" },
      {
        text: "Удалить",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteWorkingDayBreak({
              workingDayId,
              id: breakItem.id,
            }).unwrap();
            onClose();
          } catch (error) {
            toast.error(
              getApiErrorMessage(error, "Не удалось удалить перерыв"),
            );
          }
        },
      },
    ]);
  }, [breakItem, workingDayId, deleteWorkingDayBreak, onClose]);

  const canSave = start != null && end != null;
  const isBusy = isSaving || isDeleting;

  return (
    <StModal visible={visible} onClose={onClose} keyboardAware>
      <Typography weight="semibold" className="text-display text-center mb-4">
        Перерыв
      </Typography>

      <View className="gap-4">
        <Input
          label="Название"
          placeholder="Перерыв"
          value={name}
          onChangeText={setName}
          hideErrorText
        />

        <View className="flex-row items-start gap-2">
          <View className="flex-1">
            <TimeWheelField
              value={start}
              onChange={setStart}
              options={startOptions}
              hideErrorText
              endAdornment={clockAdornment}
            />
          </View>
          <Typography className="mt-[13px] text-neutral-500">—</Typography>
          <View className="flex-1">
            <TimeWheelField
              value={end}
              onChange={setEnd}
              options={endOptions}
              hideErrorText
              endAdornment={clockAdornment}
            />
          </View>
        </View>

        <Button
          title="Сохранить"
          onPress={handleSave}
          disabled={!canSave || isBusy}
          loading={isSaving}
          buttonClassName="mt-2"
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
        />
        <Button
          title="Удалить перерыв"
          variant="destructive"
          onPress={handleDelete}
          disabled={isBusy}
          loading={isDeleting}
          rightIcon={
            <StSvg name="Trash" size={24} color={colors.accent.red[500]} />
          }
        />
      </View>
    </StModal>
  );
};

export default EditBreakModal;
