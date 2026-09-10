import React, { ReactNode, Ref, useEffect, useState } from "react";
import { View } from "react-native";
import { FieldError } from "react-hook-form";

import { PressableField } from "@/src/components/ui/fields/PressableField";
import { StModal } from "@/src/components/ui/StModal";
import { Typography } from "@/src/components/ui/Typography";
import { RangeCalendar } from "@/src/components/ui/pickers/RangeCalendar";
import { formatDayMonthRange } from "@/src/utils/date/formatDate";
import { rangeToDatePair } from "@/src/utils/date/dateRange";
import { useCalendarRange, type DateRange } from "@/src/hooks/useCalendarRange";

type DateRangeFieldProps = {
  value: DateRange | null;
  onChange: (range: DateRange) => void;
  label?: string;
  placeholder?: string;
  title?: string;
  formatDisplay?: (from: Date, to: Date) => string;
  error?: FieldError;
  disabled?: boolean;
  hideErrorText?: boolean;
  fieldClassName?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  ref?: Ref<View>;
};

export const DateRangeField = ({
  value,
  onChange,
  label,
  placeholder,
  title = "Выберите период",
  formatDisplay,
  error,
  disabled,
  hideErrorText,
  fieldClassName,
  startAdornment,
  endAdornment,
  ref,
}: DateRangeFieldProps) => {
  const [open, setOpen] = useState(false);
  const { start, end, onDayPress, setRange } = useCalendarRange(value);

  const handleApply = () => {
    if (!start) return;
    onChange({ from: start, to: end ?? start });
    setOpen(false);
  };

  const datePair = rangeToDatePair(value);
  const displayValue = datePair
    ? (formatDisplay ?? formatDayMonthRange)(...datePair)
    : null;

  useEffect(() => {
    if (open) setRange(value);
  }, [open, value, setRange]);

  return (
    <>
      <PressableField
        ref={ref}
        label={label}
        error={error}
        hideErrorText={hideErrorText}
        disabled={disabled}
        fieldClassName={fieldClassName}
        startAdornment={startAdornment}
        endAdornment={endAdornment}
        onEndAdornmentPress={disabled ? undefined : () => setOpen(true)}
        value={displayValue}
        placeholder={placeholder}
        onPress={() => !disabled && setOpen(true)}
      />

      <StModal
        visible={open}
        onClose={() => setOpen(false)}
        header={
          <Typography
            weight="semibold"
            className="text-[20px] text-neutral-900 text-center"
          >
            {title}
          </Typography>
        }
      >
        <RangeCalendar
          start={start}
          end={end}
          onDayPress={onDayPress}
          onApply={handleApply}
        />
      </StModal>
    </>
  );
};
