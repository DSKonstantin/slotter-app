import React, { ReactNode, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FieldError } from "react-hook-form";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";

import { BaseField } from "@/src/components/ui/fields/BaseField";
import { StModal } from "@/src/components/ui/StModal";
import { colors } from "@/src/styles/colors";
import { pickerCalendarTheme } from "@/src/styles/calendarTheme";

type CalendarDatePickerProps = {
  value: string | null; // ISO "YYYY-MM-DD"
  onChange: (date: string) => void;
  label?: string;
  placeholder?: string;
  displayFormat?: (isoDate: string) => string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;
  endAdornment?: ReactNode;
  startAdornment?: ReactNode;
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
}: CalendarDatePickerProps) => {
  const [open, setOpen] = useState(false);
  const today = format(new Date(), "yyyy-MM-dd");

  const displayValue = value
    ? displayFormat
      ? displayFormat(value)
      : value
    : null;

  return (
    <BaseField
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
            onClose={() => setOpen(false)}
            horizontalPadding={false}
          >
            <View className="px-5 pb-2">
              <Text className="font-inter-semibold text-[20px] text-neutral-900 text-center">
                Выберите дату
              </Text>
            </View>

            <Calendar
              current={value ?? today}
              onDayPress={(day) => {
                onChange(day.dateString);
                setOpen(false);
              }}
              markedDates={
                value
                  ? {
                      [value]: {
                        selected: true,
                        selectedColor: colors.primary.blue[500],
                      },
                    }
                  : {}
              }
              theme={pickerCalendarTheme}
            />
          </StModal>
        </>
      )}
    />
  );
};
