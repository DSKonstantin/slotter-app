import React, { ReactNode } from "react";
import { RhfTimeWheelField } from "./rhf-time-wheel-field";
import { formatDuration } from "@/src/utils/date/formatTime";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
};

const parseDuration = (val: unknown): number | null => {
  const mins = Number(val);
  if (!mins && mins !== 0) return null;
  return mins;
};

export function RhfDurationPicker({
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
      options={FULL_DAY_MINUTE_OPTIONS}
      loop
      parseValue={parseDuration}
      formatDisplay={formatDuration}
    />
  );
}
