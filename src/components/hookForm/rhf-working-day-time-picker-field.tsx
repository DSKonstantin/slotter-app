import React, { useEffect, useRef } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { endOfMonth, parseISO, startOfMonth } from "date-fns";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { parseTime } from "@/src/utils/date/formatTime";
import { WorkingDayTimePickerField } from "@/src/components/ui/fields/WorkingDayTimePickerField";

type Props = {
  name: string;
  dateName: string;
  userId: number;
  label?: string;
};

export function RhfWorkingDayTimePickerField({
  name,
  dateName,
  userId,
  label,
}: Props) {
  const { control, setValue } = useFormContext();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const date: string = useWatch({ name: dateName, control });
  const prevDate = useRef(date);

  const dateFrom = date
    ? formatApiDate(startOfMonth(parseISO(date)))
    : undefined;
  const dateTo = date ? formatApiDate(endOfMonth(parseISO(date))) : undefined;

  const { data: workingDays, isFetching } = useGetWorkingDaysQuery(
    { userId, date_from: dateFrom!, date_to: dateTo! },
    { skip: !dateFrom },
  );

  useEffect(() => {
    if (prevDate.current === date) return;
    prevDate.current = date;
    setValue(name, "");
  }, [date, name, setValue]);

  const workingDay = date && workingDays ? workingDays[date] : null;
  const startMinutes = workingDay?.is_active
    ? parseTime(workingDay.start_at)
    : undefined;
  const endMinutes = workingDay?.is_active
    ? parseTime(workingDay.end_at)
    : undefined;
  const breaks = (workingDay?.working_day_breaks ?? []).map((b) => ({
    startMinutes: parseTime(b.start_at),
    endMinutes: parseTime(b.end_at),
  }));

  return (
    <WorkingDayTimePickerField
      value={value || null}
      onChange={onChange}
      label={label}
      error={error}
      startMinutes={startMinutes}
      endMinutes={endMinutes}
      breaks={breaks}
      isLoading={!!date && isFetching}
    />
  );
}
