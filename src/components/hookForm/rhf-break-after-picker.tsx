import React, { ReactNode } from "react";
import { RhfTimeWheelField } from "./rhf-time-wheel-field";
import { formatBreakAfter } from "@/src/utils/date/formatTime";
import { BREAK_AFTER_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

const parseBreakAfter = (val: unknown): number | null => {
  const mins = Number(val);
  if (!mins && mins !== 0) return null;
  return mins;
};

export function RhfBreakAfterPicker({
  name,
  label,
  placeholder,
  startAdornment,
  endAdornment = null,
}: Props) {
  return (
    <RhfTimeWheelField
      name={name}
      label={label}
      placeholder={placeholder}
      startAdornment={startAdornment}
      endAdornment={endAdornment}
      options={BREAK_AFTER_MINUTE_OPTIONS}
      parseValue={parseBreakAfter}
      formatDisplay={formatBreakAfter}
    />
  );
}
