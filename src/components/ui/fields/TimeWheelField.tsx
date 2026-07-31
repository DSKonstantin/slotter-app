import React, { ReactNode, Ref, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { FieldError } from "react-hook-form";

import { BaseField } from "@/src/components/ui/fields/BaseField";
import { StSvg } from "@/src/components/ui/StSvg";
import { colors } from "@/src/styles/colors";
import { formatMinutes } from "@/src/utils/date/formatTime";
import { TimeWheelPickerModal } from "@/src/components/ui/pickers/TimeWheelPickerModal";

type TimeWheelFieldProps = {
  value: number | null;
  onChange: (minutes: number) => void;
  options: number[];
  defaultValue?: number;

  label?: string;
  placeholder?: string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;
  isLoading?: boolean;
  loop?: boolean;
  /** Text shown instead of the placeholder when `options` is empty (e.g.
   * "Все занято"). Leave unset when an empty list doesn't mean "fully
   * booked" — e.g. the day just isn't configured yet — so the field falls
   * back to the neutral placeholder instead. */
  emptyMessage?: string;
  onOpen?: () => void;
  formatDisplay?: (minutes: number) => string;

  ref?: Ref<View>;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

export const TimeWheelField = ({
  value,
  onChange,
  options,
  defaultValue,
  label,
  placeholder = "чч:мм",
  error,
  disabled,
  hideErrorText,
  isLoading = false,
  loop = false,
  emptyMessage,
  onOpen,
  formatDisplay = formatMinutes,
  ref,
  startAdornment,
  endAdornment,
}: TimeWheelFieldProps) => {
  const [open, setOpen] = useState(false);

  const noOptions = !isLoading && options.length === 0;
  const fieldDisabled = disabled || isLoading || noOptions;

  return (
    <View>
      <BaseField
        ref={ref}
        label={label}
        error={error}
        hideErrorText={hideErrorText}
        disabled={fieldDisabled}
        startAdornment={startAdornment}
        endAdornment={
          endAdornment !== undefined ? (
            endAdornment
          ) : isLoading ? (
            <ActivityIndicator size="small" color={colors.neutral[500]} />
          ) : (
            <StSvg name="Time_light" size={24} color={colors.neutral[500]} />
          )
        }
        renderControl={() => (
          <Pressable
            className="flex-1 justify-center"
            disabled={fieldDisabled}
            onPress={() => {
              if (!fieldDisabled) {
                setOpen(true);
                onOpen?.();
              }
            }}
          >
            <Text
              className="font-inter-regular text-[16px] px-4"
              style={{
                color:
                  (noOptions && emptyMessage) || value == null
                    ? colors.neutral[300]
                    : colors.neutral[900],
              }}
            >
              {noOptions && emptyMessage
                ? emptyMessage
                : value != null
                  ? formatDisplay(value)
                  : placeholder}
            </Text>
          </Pressable>
        )}
      />
      <TimeWheelPickerModal
        visible={open}
        options={options}
        value={value}
        defaultValue={defaultValue}
        title="Выберите время"
        isLoading={isLoading}
        loop={loop}
        onConfirm={(minutes) => {
          onChange(minutes);
          setOpen(false);
        }}
        onClose={() => setOpen(false)}
      />
    </View>
  );
};
