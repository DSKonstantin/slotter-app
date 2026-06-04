import React from "react";
import { RhfDatePicker } from "./rhf-date-picker";

type Props = {
  name: string;
  label?: string;
  placeholder?: string;
};

const parseDuration = (val: unknown): Date | null => {
  const mins = Number(val);
  if (!mins && mins !== 0) return null;
  const d = new Date();
  d.setHours(Math.floor(mins / 60), mins % 60, 0, 0);
  return d;
};

const formatDuration = (d: Date): number => d.getHours() * 60 + d.getMinutes();

const displayDuration = (d: Date): string =>
  `${d.getHours() * 60 + d.getMinutes()}  `;

export function RhfDurationPicker({ name, label, placeholder }: Props) {
  return (
    <RhfDatePicker
      name={name}
      label={label}
      placeholder={placeholder}
      parseValue={parseDuration}
      formatValue={formatDuration}
      formatDisplay={displayDuration}
    />
  );
}
