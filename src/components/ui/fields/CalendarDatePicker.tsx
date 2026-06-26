import React, { ReactNode, Ref, useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { FieldError } from "react-hook-form";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";

import { BaseField } from "@/src/components/ui/fields/BaseField";
import { StModal } from "@/src/components/ui/StModal";
import { IconButton } from "@/src/components/ui/IconButton";
import { StSvg } from "@/src/components/ui/StSvg";
import { Typography } from "@/src/components/ui/Typography";
import { colors } from "@/src/styles/colors";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";
import {
  useWorkingDaysCalendar,
  type WorkingDayStatus,
} from "@/src/hooks/useWorkingDaysCalendar";
import RetryInline from "@/src/components/shared/retryInline";
import NonWorkingDayPanel from "@/src/components/shared/nonWorkingDay/NonWorkingDayPanel";

type NonWorkingDayInfo = {
  date: string;
  status: Exclude<WorkingDayStatus, "working">;
  workingDayId?: number;
};

type CalendarDatePickerProps = {
  value: string | null;
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  displayFormat?: (isoDate: string) => string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;
  ref?: Ref<View>;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
  userId?: number;
  onNonWorkingDaySuccess?: (date: string) => void;
};

export const CalendarDatePicker = ({
  value,
  onChange,
  label,
  placeholder,
  displayFormat,
  error,
  disabled,
  hideErrorText,
  endAdornment,
  startAdornment,
  ref,
  userId,
  onNonWorkingDaySuccess,
}: CalendarDatePickerProps) => {
  const today = format(new Date(), "yyyy-MM-dd");
  const [open, setOpen] = useState(false);
  const [nonWorkingDay, setNonWorkingDay] = useState<NonWorkingDayInfo | null>(
    null,
  );
  const [visibleMonth, setVisibleMonth] = useState<string | null>(null);

  const {
    markedDates,
    isLoading,
    isError,
    refetch,
    onMonthChange,
    getDayStatus,
    getWorkingDayId,
  } = useWorkingDaysCalendar(userId);

  const handleDayPress = useCallback(
    (dateString: string) => {
      if (onNonWorkingDaySuccess) {
        const status = getDayStatus(dateString);
        if (status !== "working") {
          setNonWorkingDay({
            date: dateString,
            status,
            workingDayId: getWorkingDayId(dateString),
          });
          return;
        }
      } else if (markedDates[dateString]?.disabled) {
        return;
      }
      onChange(dateString);
      setOpen(false);
    },
    [
      onNonWorkingDaySuccess,
      getDayStatus,
      getWorkingDayId,
      markedDates,
      onChange,
    ],
  );

  const handleNonWorkingDaySuccess = useCallback(
    (date: string) => {
      onChange(date);
      onNonWorkingDaySuccess?.(date);
      setNonWorkingDay(null);
      setOpen(false);
    },
    [onChange, onNonWorkingDaySuccess],
  );

  const handleClose = useCallback(() => {
    setOpen(false);
    setNonWorkingDay(null);
  }, []);

  const computedMarkedDates = (() => {
    if (onNonWorkingDaySuccess && userId) {
      const result: Record<
        string,
        { customStyles: { text?: object; container?: object } }
      > = {};
      Object.entries(markedDates).forEach(([date, mark]) => {
        if (mark.disabled) {
          result[date] = {
            customStyles: { text: { color: colors.neutral[300] } },
          };
        }
      });
      if (value) {
        result[value] = {
          customStyles: {
            container: {
              backgroundColor: colors.background.black,
              borderRadius: 16,
            },
            text: { color: colors.neutral[0], fontWeight: "600" },
          },
        };
      }
      return result;
    }

    const result: Record<string, object> = { ...markedDates };
    if (value) {
      result[value] = {
        ...(markedDates[value] ?? {}),
        selected: true,
        selectedColor: colors.primary.blue[500],
      };
    }
    return result;
  })();

  const displayValue = value
    ? displayFormat
      ? displayFormat(value)
      : value
    : null;

  return (
    <BaseField
      ref={ref}
      label={label}
      error={error}
      hideErrorText={hideErrorText}
      disabled={disabled}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      renderControl={() => (
        <>
          <Pressable
            className="flex-1 justify-center"
            disabled={disabled}
            onPress={() => !disabled && setOpen(true)}
          >
            <Text
              className="font-inter-regular text-[16px] px-4"
              style={{
                color: displayValue ? colors.neutral[900] : colors.neutral[300],
              }}
            >
              {displayValue ?? placeholder}
            </Text>
          </Pressable>

          <StModal
            visible={open}
            onClose={handleClose}
            horizontalPadding={false}
            keyboardAware={!!nonWorkingDay}
          >
            <View className="flex-row items-center px-screen pb-2 gap-2">
              {nonWorkingDay && (
                <IconButton
                  size="sm"
                  icon={
                    <StSvg
                      name="Expand_left"
                      size={24}
                      color={colors.neutral[900]}
                    />
                  }
                  onPress={() => setNonWorkingDay(null)}
                />
              )}
              <Typography
                weight="semibold"
                className="text-[20px] text-neutral-900 text-center flex-1"
              >
                {nonWorkingDay ? "Нерабочий день" : "Выберите дату"}
              </Typography>
              {nonWorkingDay && <View className="w-[36px]" />}
            </View>

            <View className="px-screen">
              {nonWorkingDay && userId ? (
                <NonWorkingDayPanel
                  date={nonWorkingDay.date}
                  status={nonWorkingDay.status}
                  workingDayId={nonWorkingDay.workingDayId}
                  userId={userId}
                  onSuccess={handleNonWorkingDaySuccess}
                />
              ) : isLoading ? (
                <View className="items-center py-6">
                  <ActivityIndicator color={colors.neutral[400]} />
                </View>
              ) : isError ? (
                <View className="py-6">
                  <RetryInline
                    text="Не удалось загрузить рабочие дни"
                    onRetry={refetch}
                    layout="column"
                  />
                </View>
              ) : (
                <Calendar
                  current={visibleMonth ?? value ?? today}
                  onDayPress={(day) => handleDayPress(day.dateString)}
                  onMonthChange={(month) => {
                    setVisibleMonth(month.dateString);
                    onMonthChange(month);
                  }}
                  markedDates={computedMarkedDates}
                  markingType={
                    onNonWorkingDaySuccess && userId ? "custom" : "dot"
                  }
                  disableAllTouchEventsForDisabledDays={!onNonWorkingDaySuccess}
                  hideExtraDays
                  theme={pickerCalendarTheme}
                />
              )}
            </View>
          </StModal>
        </>
      )}
    />
  );
};
