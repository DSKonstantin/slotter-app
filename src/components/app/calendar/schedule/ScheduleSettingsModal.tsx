import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Alert, StyleSheet, View, useWindowDimensions } from "react-native";
import { useFormContext, useWatch } from "react-hook-form";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetBackgroundProps,
} from "@gorhom/bottom-sheet";
import { RhfFormProvider } from "@/src/components/hookForm/rhf-form-provider";

import { WorkingHoursFields } from "@/src/components/shared/timeFields/WorkingHoursFields";
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
import type {
  CalendarScheduleDayValues,
  CalendarScheduleFormValues,
} from "@/src/validation/schemas/calendarSchedule.schema";
import { BlurView } from "expo-blur";
import {
  DEFAULT_BREAK_END,
  DEFAULT_BREAK_START,
  DEFAULT_END_AT,
  DEFAULT_START_AT,
} from "@/src/constants/hoursOptions";
import { SCREEN_PADDING } from "@/src/constants/layout";

const EMPTY_DAYS: CalendarScheduleDayValues[] = [];
const renderNullBackdrop = () => null;
const renderBlurBackground = ({ style }: BottomSheetBackgroundProps) => (
  <BlurView intensity={50} tint="light" style={[style, styles.background]} />
);

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (values: CalendarScheduleFormValues) => void | Promise<void>;
  isLoading?: boolean;
};

export const ScheduleSettingsModal = ({
  visible,
  onClose,
  onSave,
  isLoading,
}: Props) => {
  const methods = useFormContext<CalendarScheduleFormValues>();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const hasBeenPresentedRef = useRef(false);
  const pendingScrollToErrorRef = useRef<(() => void) | null>(null);
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const snapPoints = useMemo(() => ["20%", "45%", height - top], [height, top]);

  const { control, setValue } = methods;
  const mode = useWatch({ control, name: "mode" }) ?? "bulk";
  const calendarDays =
    useWatch({ control, name: "calendarDays" }) ?? EMPTY_DAYS;

  const { selectedEditableDays, hasBlockedDays, totalCount } = useMemo(() => {
    const editable: { day: CalendarScheduleDayValues; index: number }[] = [];
    let blocked = 0;
    calendarDays.forEach((day, index) => {
      if (!day.isSelected) return;
      if (day.isExisting) blocked++;
      else editable.push({ day, index });
    });
    return {
      selectedEditableDays: editable,
      hasBlockedDays: blocked > 0,
      totalCount: editable.length + blocked,
    };
  }, [calendarDays]);
  const canSave = selectedEditableDays.length > 0;

  const switchMode = useCallback(
    (nextMode: string) => {
      if (nextMode === mode) return;

      if (nextMode === "perDay") {
        selectedEditableDays.forEach(({ day, index }) => {
          setValue(
            `calendarDays.${index}`,
            { ...day, startAt: "", endAt: "", breaks: [] },
            { shouldDirty: true },
          );
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
                { startAt: "", endAt: "", breaks: [] },
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

  useEffect(() => {
    if (visible && totalCount === 0) {
      onClose();
      return;
    }
    if (visible) {
      bottomSheetRef.current?.present();
      hasBeenPresentedRef.current = true;
      return;
    }
    if (hasBeenPresentedRef.current) {
      bottomSheetRef.current?.dismiss();
    }
  }, [onClose, totalCount, visible]);

  return (
    <BottomSheetModal
      ref={bottomSheetRef}
      index={1}
      snapPoints={snapPoints}
      topInset={top}
      enablePanDownToClose={false}
      enableOverDrag={false}
      detached
      style={styles.sheet}
      backgroundComponent={renderBlurBackground}
      handleIndicatorStyle={styles.handle}
      backdropComponent={renderNullBackdrop}
      onDismiss={onClose}
      onChange={(index) => {
        if (
          index === snapPoints.length - 1 &&
          pendingScrollToErrorRef.current
        ) {
          const run = pendingScrollToErrorRef.current;
          pendingScrollToErrorRef.current = null;
          requestAnimationFrame(run);
        }
      }}
    >
      <RhfFormProvider methods={methods} offset={16}>
        {({ setScrollRef, contentRef, scrollToError }) => {
          const submit = methods.handleSubmit(onSave, (errors) => {
            pendingScrollToErrorRef.current = () => scrollToError(errors);
            bottomSheetRef.current?.expand();
          });
          return (
            <>
              <View className="flex-row items-center mb-4 px-screen pt-4">
                <IconButton
                  size="sm"
                  buttonClassName="bg-transparent"
                  onPress={onClose}
                  icon={
                    <StSvg
                      name="Close_round"
                      size={20}
                      color={colors.neutral[900]}
                    />
                  }
                />
                <Typography
                  weight="semibold"
                  className="text-body text-center flex-1"
                >
                  {totalCount} {pluralize(totalCount, ["день", "дня", "дней"])}{" "}
                  выбрано
                </Typography>
                <IconButton
                  size="sm"
                  disabled={isLoading || !canSave}
                  onPress={submit}
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

              {hasBlockedDays && (
                <View className="px-screen py-2.5 bg-accent-yellow-500/50 mb-4 rounded-small flex-row gap-2 items-center mx-5">
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
                <View className="mb-4 px-screen">
                  <SegmentedControl
                    options={[
                      { label: "Для всех", value: "bulk" },
                      { label: "По дням", value: "perDay" },
                    ]}
                    value={mode}
                    onChange={switchMode}
                  />
                </View>
              )}

              {/* Content */}
              <BottomSheetScrollView
                ref={setScrollRef as never}
                contentContainerStyle={[
                  styles.content,
                  { paddingBottom: Math.max(bottom, 16) },
                ]}
              >
                <View ref={contentRef} collapsable={false}>
                  {canSave ? (
                    mode === "bulk" ? (
                      <View className="mb-4">
                        <WorkingHoursFields
                          label="Рабочее время"
                          startName="commonDraft.startAt"
                          endName="commonDraft.endAt"
                          breaksName="commonDraft.breaks"
                          startDefault={DEFAULT_START_AT}
                          endDefault={DEFAULT_END_AT}
                          breakStartDefault={DEFAULT_BREAK_START}
                          breakEndDefault={DEFAULT_BREAK_END}
                        />
                      </View>
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
                            <WorkingHoursFields
                              startName={`calendarDays.${index}.startAt`}
                              endName={`calendarDays.${index}.endAt`}
                              breaksName={`calendarDays.${index}.breaks`}
                              startDefault={DEFAULT_START_AT}
                              endDefault={DEFAULT_END_AT}
                              breakStartDefault={DEFAULT_BREAK_START}
                              breakEndDefault={DEFAULT_BREAK_END}
                            />
                          </View>
                        ))}
                      </View>
                    )
                  ) : (
                    <Typography className="text-caption text-neutral-400 mb-4">
                      Рабочее время для выбранных дат уже установлено. Перейдите
                      к редактированию соответствующих дней.
                    </Typography>
                  )}

                  <Button
                    title="Сохранить расписание"
                    loading={isLoading}
                    disabled={isLoading || !canSave}
                    rightIcon={
                      <StSvg
                        name="Save_fill"
                        size={24}
                        color={colors.neutral[0]}
                      />
                    }
                    onPress={submit}
                  />
                </View>
              </BottomSheetScrollView>
            </>
          );
        }}
      </RhfFormProvider>
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
  content: {
    paddingHorizontal: SCREEN_PADDING,
  },
});
