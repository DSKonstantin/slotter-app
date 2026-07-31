import React, { useEffect, useMemo, useRef } from "react";
import { useController, useFormContext, useWatch } from "react-hook-form";
import { endOfMonth, parseISO, startOfMonth } from "date-fns";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import { formatMinutes, parseTime } from "@/src/utils/date/formatTime";
import { buildMinuteOptions } from "@/src/utils/date/timeOptions";
import { TimeWheelField } from "@/src/components/ui/fields/TimeWheelField";

type Props = {
  name: string;
  dateName: string;
  durationName: string;
  userId: number;
  label?: string;
};

export function RhfWorkingDayTimePickerField({
  name,
  dateName,
  durationName,
  userId,
  label,
}: Props) {
  const prevDate = useRef<string | undefined>(undefined);

  const { control, setValue } = useFormContext();
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name, control });

  const date: string = useWatch({ name: dateName, control });
  const duration: number | undefined = useWatch({
    name: durationName,
    control,
  });

  const parsedDate = date ? parseISO(date) : null;
  const dateFrom = parsedDate
    ? formatApiDate(startOfMonth(parsedDate))
    : undefined;
  const dateTo = parsedDate ? formatApiDate(endOfMonth(parsedDate)) : undefined;

  const {
    data: workingDays,
    isFetching,
    refetch: refetchWorkingDays,
  } = useGetWorkingDaysQuery(
    { userId, date_from: dateFrom!, date_to: dateTo! },
    { skip: !dateFrom },
  );

  const {
    data: appointmentsData,
    isFetching: isFetchingAppointments,
    refetch: refetchAppointments,
  } = useGetAppointmentsQuery({ userId, params: { date } }, { skip: !date });

  const workingDay = date && workingDays ? workingDays[date] : null;
  const startMinutes = workingDay?.is_active
    ? parseTime(workingDay.start_at)
    : undefined;
  const endMinutes = workingDay?.is_active
    ? parseTime(workingDay.end_at)
    : undefined;

  const breaks = useMemo(() => {
    const wd = date && workingDays ? workingDays[date] : null;
    const workingDayBreaks = (wd?.working_day_breaks ?? []).map((b) => ({
      startMinutes: parseTime(b.start_at),
      endMinutes: parseTime(b.end_at),
    }));

    const appointments = Array.isArray(appointmentsData)
      ? appointmentsData
      : Object.values(appointmentsData ?? {}).flat();

    const occupiedRanges = appointments
      .filter((a) => a.status !== "cancelled")
      .map((a) => ({
        startMinutes: parseTime(a.start_time),
        endMinutes: parseTime(a.end_time),
      }));

    if (!duration || occupiedRanges.length === 0) {
      return workingDayBreaks;
    }

    const expandedOccupied = occupiedRanges.map((r) => ({
      startMinutes: r.startMinutes - duration + 1,
      endMinutes: r.endMinutes,
    }));

    return [...workingDayBreaks, ...expandedOccupied];
  }, [workingDays, date, appointmentsData, duration]);

  const adjustedEndMinutes =
    endMinutes !== undefined && duration ? endMinutes - duration : endMinutes;

  const isDayConfigured =
    startMinutes !== undefined && adjustedEndMinutes !== undefined;

  const options = useMemo(() => {
    if (!isDayConfigured) return [];
    return buildMinuteOptions({
      start: startMinutes!,
      end: adjustedEndMinutes!,
      step: 5,
      exclude: breaks,
    });
  }, [isDayConfigured, startMinutes, adjustedEndMinutes, breaks]);

  useEffect(() => {
    if (prevDate.current === undefined) {
      prevDate.current = date;
      return;
    }
    if (prevDate.current === date) return;
    prevDate.current = date;
    setValue(name, null);
  }, [date, name, setValue]);

  return (
    <TimeWheelField
      value={value ? parseTime(value) : null}
      onChange={(minutes) => onChange(formatMinutes(minutes))}
      options={options}
      emptyMessage={isDayConfigured ? "Все занято" : undefined}
      label={label}
      error={error}
      isLoading={isFetching || isFetchingAppointments}
      onOpen={() => {
        refetchWorkingDays();
        refetchAppointments();
      }}
    />
  );
}
