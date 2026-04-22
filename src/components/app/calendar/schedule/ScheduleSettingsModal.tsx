import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";
import { FormProvider, useFormContext, useWatch } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";

import { BreaksFieldArray } from "@/src/components/shared/timeFields/BreaksFieldArray";
import { TimeFields } from "@/src/components/shared/timeFields/TimeFields";
import {
  Button,
  Divider,
  IconButton,
  SegmentedControl,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { pluralize } from "@/src/utils/text/pluralize";
import { formatDayMonthLong } from "@/src/utils/date/formatDate";
import { parseISO } from "date-fns";
import { clearSelectedDay } from "@/src/utils/calendar/scheduleHelpers";
import type { CalendarScheduleFormValues } from "@/src/validation/schemas/calendarSchedule.schema";
import { BlurView } from "expo-blur";

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: () => void;
  isLoading?: boolean;
};

const ScheduleSettingsModalHeader = ({
  totalCount,
  canSave,
  isLoading,
  onClose,
  onSave,
}: {
  totalCount: number;
  canSave: boolean;
  isLoading?: boolean;
  onClose: () => void;
  onSave: () => void;
}) => (
  <View className="flex-row items-center mb-4 px-5 pt-4">
    <IconButton
      size="sm"
      buttonClassName="bg-transparent"
      onPress={onClose}
      icon={<StSvg name="Close_round" size={20} color={colors.neutral[900]} />}
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
);

const ScheduleSettingsModalControls = ({
  blockedDays,
  selectedEditableDays,
  mode,
  onModeChange,
}: {
  blockedDays: any[];
  selectedEditableDays: any[];
  mode: string;
  onModeChange: (nextMode: string) => void;
}) => (
  <>
    {blockedDays.length > 0 && (
      <View className="px-5 py-2.5 bg-accent-yellow-500/50 mb-4 rounded-small flex-row gap-2 items-center mx-5">
        <StSvg name="Alarm_fill" size={24} color={colors.accent.yellow[700]} />
        <Typography className="text-caption text-accent-yellow-700">
          Среди выбранных есть дни с записями
        </Typography>
      </View>
    )}

    {selectedEditableDays.length > 1 && (
      <View className="mb-4 px-5">
        <SegmentedControl
          options={[
            { label: "Одинаково", value: "bulk" },
            { label: "По дням", value: "perDay" },
          ]}
          value={mode}
          onChange={onModeChange}
        />
      </View>
    )}
  </>
);

const ScheduleSettingsModalContent = ({
  onSave,
  isLoading,
}: Omit<Props, "visible" | "onClose">) => {
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

  return (
    <View style={styles.content}>
      {canSave ? (
        mode === "bulk" ? (
          <>
            <TimeFields
              label="Рабочее время"
              startName="commonDraft.scheduleStart"
              endName="commonDraft.scheduleEnd"
            />
            <View className="mt-3 mb-4">
              <BreaksFieldArray name="commonDraft.breaks" />
            </View>
          </>
        ) : (
          <View className="gap-4 mb-4">
            {selectedEditableDays.map(({ day, index }, i) => (
              <View key={day.date}>
                {i > 0 && <Divider className="mb-4" />}
                <View className="flex-row items-center justify-between mb-2">
                  <Typography className="text-neutral-500 text-caption">
                    {`Рабочее время · ${formatDayMonthLong(parseISO(day.date))}`}
                  </Typography>
                  <IconButton
                    size="xs"
                    buttonClassName="bg-accent-red-500"
                    onPress={() => removeDay(index)}
                    icon={
                      <StSvg
                        name="Close_square"
                        size={20}
                        color={colors.neutral[0]}
                      />
                    }
                  />
                </View>
                <TimeFields
                  startName={`calendarDays.${index}.scheduleStart`}
                  endName={`calendarDays.${index}.scheduleEnd`}
                />
                <View className="mt-3">
                  <BreaksFieldArray name={`calendarDays.${index}.breaks`} />
                </View>
              </View>
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
    </View>
  );
};

export const ScheduleSettingsModal = ({
  visible,
  onClose,
  onSave,
  isLoading,
}: Props) => {
  const methods = useFormContext<CalendarScheduleFormValues>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["20%", "45%", height - top], [height, top]);

  const { control, setValue } = methods;
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
  const totalCount = selectedEditableDays.length + blockedDays.length;
  const canSave = selectedEditableDays.length > 0;

  const switchMode = useCallback(
    (nextMode: string) => {
      if (nextMode === mode) return;

      if (nextMode === "perDay") {
        selectedEditableDays.forEach(({ index }) => {
          setValue(`calendarDays.${index}.scheduleStart`, "", {
            shouldDirty: true,
          });
          setValue(`calendarDays.${index}.scheduleEnd`, "", {
            shouldDirty: true,
          });
          setValue(`calendarDays.${index}.breaks`, [], { shouldDirty: true });
        });
        setValue("mode", "perDay", { shouldDirty: true });
        return;
      }

      Alert.alert(
        "Переключить режим?",
        "Индивидуальные настройки дней будут сброшены.",
        [
          { text: "Отмена", style: "cancel" },
          {
            text: "Переключить",
            style: "destructive",
            onPress: () => {
              setValue(
                "commonDraft",
                { scheduleStart: "", scheduleEnd: "", breaks: [] },
                { shouldDirty: true },
              );
              setValue("mode", "bulk", { shouldDirty: true });
            },
          },
        ],
      );
    },
    [mode, selectedEditableDays, setValue],
  );

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

  const renderBackdrop = useCallback(() => null, []);

  useEffect(() => {
    if (visible) {
      bottomSheetRef.current?.present();
    } else {
      bottomSheetRef.current?.dismiss();
    }
  }, [visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      enablePanDownToClose={false}
      enableOverDrag={false}
      detached
      style={styles.sheet}
      backgroundComponent={renderBackground}
      handleIndicatorStyle={styles.handle}
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
    >
      <ScheduleSettingsModalHeader
        totalCount={totalCount}
        canSave={canSave}
        isLoading={isLoading}
        onClose={onClose}
        onSave={onSave}
      />
      <ScheduleSettingsModalControls
        blockedDays={blockedDays}
        selectedEditableDays={selectedEditableDays}
        mode={mode}
        onModeChange={switchMode}
      />
      <FormProvider {...methods}>
        <BottomSheetScrollView contentContainerStyle={styles.content}>
          <ScheduleSettingsModalContent onSave={onSave} isLoading={isLoading} />
        </BottomSheetScrollView>
      </FormProvider>
    </BottomSheetModal>
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
    backgroundColor: colors.background.card,
  },
  handle: {
    backgroundColor: colors.neutral[300],
    width: 40,
  },
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
});
