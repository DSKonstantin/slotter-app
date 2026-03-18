import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { BlurView } from "expo-blur";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import BottomSheet, {
  BottomSheetScrollView,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";

import { RhfDatePicker } from "@/src/components/hookForm/rhf-date-picker";
import { DayScheduleBreaksFieldArray } from "@/src/components/app/calendar/daySchedule/DayScheduleBreaksFieldArray";
import {
  Button,
  Divider,
  IconButton,
  SegmentedControl,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatTime, parseTimeString } from "@/src/utils/date/formatTime";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { pluralize } from "@/src/utils/text/pluralize";
import {
  areUniformDays,
  clearSelectedDay,
  createDraftFromDay,
} from "@/src/utils/calendar/scheduleHelpers";
import type { CalendarScheduleFormValues } from "@/src/validation/schemas/calendarSchedule.schema";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoading?: boolean;
};

const ScheduleTimeFields = ({
  startName,
  endName,
}: {
  startName: string;
  endName: string;
}) => (
  <View className="flex-row gap-2">
    <View className="flex-1">
      <RhfDatePicker
        name={startName}
        placeholder="9:00"
        hideErrorText
        parseValue={parseTimeString}
        formatValue={formatTime}
        endAdornment={
          <StSvg name="Time" size={24} color={colors.neutral[500]} />
        }
      />
    </View>
    <View className="w-5 items-center mt-[25px]">
      <Divider />
    </View>
    <View className="flex-1">
      <RhfDatePicker
        name={endName}
        placeholder="18:00"
        hideErrorText
        parseValue={parseTimeString}
        formatValue={formatTime}
        endAdornment={
          <StSvg name="Time" size={24} color={colors.neutral[500]} />
        }
      />
    </View>
  </View>
);

const DayScheduleCard = ({
  index,
  date,
  onRemove,
}: {
  index: number;
  date: string;
  onRemove: () => void;
}) => (
  <View className="rounded-[28px] bg-background-surface px-4 py-4">
    <View className="flex-row items-center justify-between gap-3 mb-3">
      <View>
        <Typography weight="semibold" className="text-body capitalize">
          {format(parseISO(date), "d MMMM", { locale: ru })}
        </Typography>
        <Typography className="text-caption text-neutral-500 capitalize">
          {format(parseISO(date), "EEEE", { locale: ru })}
        </Typography>
      </View>
      <IconButton
        size="sm"
        onPress={onRemove}
        buttonClassName="bg-accent-red-500"
        icon={<StSvg name="Close_square" size={24} color={colors.neutral[0]} />}
      />
    </View>
    <ScheduleTimeFields
      startName={`calendarDays.${index}.scheduleStart`}
      endName={`calendarDays.${index}.scheduleEnd`}
    />
    <View className="mt-3">
      <DayScheduleBreaksFieldArray name={`calendarDays.${index}.breaks`} />
    </View>
  </View>
);

const ScheduleSettingsModalContent = ({
  onClose,
  onSave,
  isLoading,
}: Omit<Props, "visible">) => {
  const { control, setValue } = useFormContext<CalendarScheduleFormValues>();
  const mode = useWatch({ control, name: "mode" }) ?? "bulk";
  const watchedCalendarDays = useWatch({ control, name: "calendarDays" });
  const calendarDays = useMemo(
    () => watchedCalendarDays ?? [],
    [watchedCalendarDays],
  );

  const selectedEditableDays = useMemo(
    () =>
      calendarDays
        .map((day, index) => ({ day, index }))
        .filter(({ day }) => day.isSelected && !day.isExisting),
    [calendarDays],
  );
  const blockedDays = useMemo(
    () => calendarDays.filter((day) => day.isSelected && day.isExisting),
    [calendarDays],
  );
  const canSave = selectedEditableDays.length > 0;

  const removeDay = useCallback(
    (index: number) => {
      const currentDay = calendarDays[index];
      if (!currentDay || currentDay.isExisting) return;

      setValue(`calendarDays.${index}`, clearSelectedDay(currentDay), {
        shouldDirty: true,
      });

      if (selectedEditableDays.length === 1) {
        setValue("mode", "bulk");
      }
    },
    [calendarDays, selectedEditableDays.length, setValue],
  );

  const switchMode = useCallback(
    (nextMode: string) => {
      if (nextMode === mode) return;

      if (nextMode === "perDay") {
        setValue("mode", "perDay", { shouldDirty: true });
        return;
      }

      const scheduleDays = selectedEditableDays.map(({ day }) => day);
      const firstDay = scheduleDays[0];

      const applyBulkMode = () => {
        if (firstDay) {
          setValue("commonDraft", createDraftFromDay(firstDay), {
            shouldDirty: true,
          });
        }
        setValue("mode", "bulk", { shouldDirty: true });
      };

      if (areUniformDays(scheduleDays)) {
        applyBulkMode();
        return;
      }

      Alert.alert(
        "Переключить режим?",
        "Индивидуальные настройки будут заменены общим расписанием.",
        [
          { text: "Отмена", style: "cancel" },
          { text: "Переключить", style: "destructive", onPress: applyBulkMode },
        ],
      );
    },
    [mode, selectedEditableDays, setValue],
  );

  const totalCount = selectedEditableDays.length + blockedDays.length;

  return (
    <>
      <View className="flex-row items-center mb-4">
        <IconButton
          size="sm"
          buttonClassName="bg-transparent"
          onPress={onClose}
          icon={
            <StSvg name="Close_round" size={20} color={colors.neutral[900]} />
          }
        />
        <Typography weight="semibold" className="text-body text-center flex-1">
          {totalCount} {pluralize(totalCount, ["день", "дня", "дней"])} выбрано
        </Typography>
        <IconButton
          size="sm"
          disabled={isLoading || !canSave}
          onPress={onSave}
          buttonClassName="bg-transparent"
          icon={
            <StSvg
              name="Done_round"
              size={20}
              color={
                canSave && !isLoading
                  ? colors.primary.blue[500]
                  : colors.neutral[500]
              }
            />
          }
        />
      </View>

      {blockedDays.length > 0 && (
        <View className="px-4 py-2.5 bg-accent-yellow-500/50 mb-4 rounded-small flex-row gap-2 items-center">
          <StSvg
            name="Alarm_fill"
            size={24}
            color={colors.accent.yellow[700]}
          />
          <Typography className="text-caption text-accent-yellow-700">
            Среди выбранных есть дни с записями
          </Typography>
        </View>
      )}

      {selectedEditableDays.length > 1 && (
        <View className="mb-4">
          <SegmentedControl
            options={[
              { label: "Одинаково", value: "bulk" },
              { label: "По дням", value: "perDay" },
            ]}
            value={mode}
            onChange={switchMode}
          />
        </View>
      )}

      {canSave ? (
        mode === "bulk" ? (
          <>
            <ScheduleTimeFields
              startName="commonDraft.scheduleStart"
              endName="commonDraft.scheduleEnd"
            />
            <View className="mt-3 mb-4">
              <DayScheduleBreaksFieldArray name="commonDraft.breaks" />
            </View>
          </>
        ) : (
          <View className="gap-3 mb-4">
            {selectedEditableDays.map(({ day, index }) => (
              <DayScheduleCard
                key={day.date}
                index={index}
                date={day.date}
                onRemove={() => removeDay(index)}
              />
            ))}
          </View>
        )
      ) : (
        <Typography className="text-caption text-neutral-400 mb-4">
          Рабочее время для выбранных дат уже установлено. Перейдите к
          редактированию соответствующих дней.
        </Typography>
      )}

      <Button
        title="Сохранить расписание"
        loading={isLoading}
        disabled={isLoading || !canSave}
        rightIcon={
          <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
        }
        onPress={onSave}
      />
    </>
  );
};

export const ScheduleSettingsModal = ({
  visible,
  onClose,
  onSave,
  isLoading,
}: Props) => {
  const { bottom } = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ["45%", "85%"], []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.snapToIndex(0);
    } else {
      bottomSheetRef.current?.close();
    }
  }, [visible]);

  const renderBackground = useCallback(
    ({ style }: BottomSheetBackgroundProps) => (
      <BlurView
        intensity={50}
        tint="light"
        style={[style, styles.background]}
      />
    ),
    [],
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      detached
      bottomInset={TAB_BAR_HEIGHT + bottom + 16}
      style={styles.sheet}
      backgroundComponent={renderBackground}
      handleIndicatorStyle={styles.handle}
      onChange={(index) => {
        if (index === -1) onClose();
      }}
    >
      <BottomSheetScrollView contentContainerStyle={styles.content}>
        <ScheduleSettingsModalContent
          onClose={onClose}
          onSave={onSave}
          isLoading={isLoading}
        />
      </BottomSheetScrollView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheet: {
    marginHorizontal: 0,
    borderWidth: 1,
    borderColor: "#E6E6E6CC",
    borderRadius: 36,
    overflow: "hidden",
  },
  background: {
    borderRadius: 36,
  },
  handle: {
    backgroundColor: colors.neutral[300],
    width: 40,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
