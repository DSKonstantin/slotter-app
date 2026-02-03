import React, { ReactNode, useMemo, useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";
import { FieldError } from "react-hook-form";

import { BaseField } from "@/src/components/ui/fields/BaseField";
import { Button } from "@/src/components/ui/Button";
import { StModal } from "@/src/components/ui/StModal";
import { Typography } from "@/src/components/ui/Typography";
import { colors } from "@/src/styles/colors";
import { formatTime } from "@/src/utils/date/formatTime";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

type DatePickerProps = {
  value: Date | null;
  onChange: (value: Date) => void;

  label?: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;

  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export const DatePicker = ({
  value,
  onChange,
  label,
  placeholder,
  error,
  hideErrorText,
  disabled,
  startAdornment,
  endAdornment,
}: DatePickerProps) => {
  const [open, setOpen] = useState(false);

  const safeValue = useMemo(() => {
    if (value instanceof Date && !Number.isNaN(value.getTime())) return value;
    return new Date();
  }, [value]);

  const [tempValue, setTempValue] = useState<Date>(safeValue);

  const openPicker = () => {
    if (disabled) return;
    setOpen(true);
  };

  const onChangeAndroid = (_: DateTimePickerEvent, selected?: Date) => {
    setOpen(false);

    if (selected) {
      onChange(selected);
    }
  };

  const onChangeIOS = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) {
      setTempValue(selected);
    }
  };

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
            onPress={openPicker}
          >
            <Text
              className="font-inter-regular text-[16px] px-4"
              style={{
                color: value ? colors.neutral[900] : colors.neutral[300],
              }}
            >
              {value ? formatTime(value) : placeholder}
            </Text>
          </Pressable>

          {/* ANDROID */}
          {Platform.OS === "android" && open && (
            <RNDateTimePicker
              value={safeValue}
              mode="time"
              themeVariant="light"
              is24Hour
              display="spinner"
              onChange={onChangeAndroid}
            />
          )}

          {/* IOS */}
          {Platform.OS === "ios" && (
            <StModal visible={open} onClose={() => setOpen(false)}>
              <Typography
                weight="semibold"
                className="text-display text-center"
              >
                Выберите время
              </Typography>

              <View className="mt-6 items-center">
                <RNDateTimePicker
                  value={tempValue}
                  mode="time"
                  is24Hour
                  themeVariant="light"
                  display="spinner"
                  onChange={onChangeIOS}
                />
              </View>

              <View className="mt-6 gap-3">
                <Button
                  title="Готово"
                  onPress={() => {
                    onChange(tempValue);
                    setOpen(false);
                  }}
                />
                <Button
                  title="Отмена"
                  variant="secondary"
                  onPress={() => setOpen(false)}
                />
              </View>
            </StModal>
          )}
        </>
      )}
    />
  );
};
