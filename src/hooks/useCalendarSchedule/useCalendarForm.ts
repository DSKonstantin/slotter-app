import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format } from "date-fns";

import {
  CalendarScheduleSchema,
  type CalendarScheduleFormValues,
} from "@/src/validation/schemas/calendarSchedule.schema";

export const useCalendarForm = (
  current: Date,
  initialFormValues: CalendarScheduleFormValues,
) => {
  const methods = useForm<CalendarScheduleFormValues>({
    resolver: (values, context, options) =>
      yupResolver(CalendarScheduleSchema)(
        values,
        { ...context, mode: values.mode },
        options,
      ),
    defaultValues: initialFormValues,
  });

  const { control, formState, reset } = methods;
  const previousMonthKeyRef = useRef(format(current, "yyyy-MM"));
  const isDirtyRef = useRef(formState.isDirty);
  isDirtyRef.current = formState.isDirty;

  const watchedMode = useWatch({ control, name: "mode" }) ?? "bulk";
  const watchedCommonDraft =
    useWatch({ control, name: "commonDraft" }) ?? initialFormValues.commonDraft;
  const watchedCalendarDays = useWatch({ control, name: "calendarDays" });

  const calendarDays = useMemo(
    () => watchedCalendarDays ?? initialFormValues.calendarDays,
    [initialFormValues.calendarDays, watchedCalendarDays],
  );

  const editableSelectedDays = useMemo(
    () => calendarDays.filter((day) => day.isSelected && !day.isExisting),
    [calendarDays],
  );

  const hasPendingEditableSelection = editableSelectedDays.length > 0;
  const modalVisible = useMemo(
    () => calendarDays.some((day) => day.isSelected),
    [calendarDays],
  );

  // Reset form on month change
  useEffect(() => {
    const monthKey = format(current, "yyyy-MM");
    const monthChanged = previousMonthKeyRef.current !== monthKey;
    previousMonthKeyRef.current = monthKey;

    if (!isDirtyRef.current || monthChanged) {
      reset(initialFormValues);
    }
  }, [current, initialFormValues, reset]);

  return {
    methods,
    watchedMode,
    watchedCommonDraft,
    calendarDays,
    editableSelectedDays,
    hasPendingEditableSelection,
    modalVisible,
  };
};
