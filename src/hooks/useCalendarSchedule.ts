import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { format, getDay, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { skipToken } from "@reduxjs/toolkit/query";
import { toast } from "@backpackapp-io/react-native-toast";

import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useScheduleTemplate } from "@/src/hooks/useScheduleTemplate";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setScheduleIntent } from "@/src/store/redux/slices/calendarSlice";
import {
  useBulkCreateWorkingDaysMutation,
  useGetWorkingDaysQuery,
} from "@/src/store/redux/services/api/workingDaysApi";
import { useGetAppointmentsQuery } from "@/src/store/redux/services/api/appointmentsApi";
import type { Appointment } from "@/src/store/redux/services/api-types";
import {
  CalendarScheduleSchema,
  type CalendarScheduleFormValues,
} from "@/src/validation/schemas/calendarSchedule.schema";
import type { ScheduleTemplateFormValues } from "@/src/validation/schemas/scheduleTemplate.schema";
import { getApiErrorMessage } from "@/src/utils/apiError";
import {
  applyDraftToDay,
  areSameCalendarDays,
  areUniformDays,
  buildFormValues,
  clearSelectedDay,
  cloneBreaks,
  createDraftFromDay,
} from "@/src/utils/calendar/scheduleHelpers";

export const useCalendarSchedule = (current: Date) => {
  const dispatch = useAppDispatch();
  const auth = useRequiredAuth();
  const intent = useAppSelector((state) => state.calendar.scheduleIntent);
  const { initialValues, isLoaded } = useScheduleTemplate();

  const [modalTemplate, setModalTemplate] = useState(false);

  const [bulkCreateWorkingDays, { isLoading: isSaving }] =
    useBulkCreateWorkingDaysMutation();

  const dateRange = useMemo(() => {
    if (!auth) return null;
    return {
      userId: auth.userId,
      date_from: format(startOfMonth(current), "yyyy-MM-dd"),
      date_to: format(endOfMonth(current), "yyyy-MM-dd"),
    };
  }, [auth, current]);

  const { data: workingDaysData } = useGetWorkingDaysQuery(
    dateRange ?? skipToken,
  );

  const { data: appointmentsData } = useGetAppointmentsQuery(
    dateRange
      ? {
          userId: dateRange.userId,
          params: {
            date_from: dateRange.date_from,
            date_to: dateRange.date_to,
            status: ["pending", "confirmed"],
          },
        }
      : skipToken,
  );

  const appointmentDates = useMemo(() => {
    const data =
      (appointmentsData as Record<string, Appointment[]> | undefined) ?? {};
    return new Set(Object.keys(data).filter((date) => data[date].length > 0));
  }, [appointmentsData]);

  const initialFormValues = useMemo(
    () => buildFormValues(current, workingDaysData),
    [current, workingDaysData],
  );

  const methods = useForm<CalendarScheduleFormValues>({
    resolver: (values, context, options) =>
      (yupResolver(CalendarScheduleSchema) as any)(
        values,
        { ...context, mode: values.mode },
        options,
      ),
    defaultValues: initialFormValues,
  });

  const { control, formState, getValues, handleSubmit, reset, setValue } =
    methods;
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
  const modalVisible = calendarDays.some((day) => day.isSelected);

  const clearSelection = useCallback(() => {
    const currentCalendarDays = getValues("calendarDays") ?? [];
    const nextCalendarDays = currentCalendarDays.map(clearSelectedDay);

    if (!areSameCalendarDays(currentCalendarDays, nextCalendarDays)) {
      setValue("calendarDays", nextCalendarDays);
    }
    setValue("mode", "bulk");
    setValue("commonDraft", { scheduleStart: "", scheduleEnd: "", breaks: [] });
  }, [getValues, setValue]);

  const toggleDay = useCallback(
    (dateKey: string) => {
      const currentCalendarDays = getValues("calendarDays") ?? [];
      const draft = getValues("commonDraft");
      const nextCalendarDays = currentCalendarDays.map((day) => {
        if (day.date !== dateKey || day.isExisting) return day;
        return day.isSelected
          ? clearSelectedDay(day)
          : applyDraftToDay({ ...day, isSelected: true }, draft);
      });
      setValue("calendarDays", nextCalendarDays, { shouldDirty: true });
    },
    [getValues, setValue],
  );

  const handleSave = useCallback(
    async (values: CalendarScheduleFormValues) => {
      if (!auth) return;

      const workingDays = values.calendarDays
        .filter(
          (day) =>
            day.isSelected &&
            !day.isExisting &&
            !!day.scheduleStart &&
            !!day.scheduleEnd,
        )
        .map((day) => ({
          day: day.date,
          start_at: day.scheduleStart!,
          end_at: day.scheduleEnd!,
          ...(day.breaks.length > 0 && {
            working_day_breaks: day.breaks.map((item) => ({
              start_at: item.start,
              end_at: item.end,
            })),
          }),
        }));

      if (workingDays.length === 0) {
        toast.error("Выберите хотя бы один свободный день");
        return;
      }

      try {
        await bulkCreateWorkingDays({
          userId: auth.userId,
          working_days: workingDays,
        }).unwrap();
        reset(initialFormValues);
      } catch (error) {
        toast.error(
          getApiErrorMessage(error, "Не удалось сохранить расписание"),
        );
      }
    },
    [auth, bulkCreateWorkingDays, initialFormValues, reset],
  );

  const applyTemplateDays = useCallback(
    (templateDays: ScheduleTemplateFormValues["days"]) => {
      const currentCalendarDays = getValues("calendarDays") ?? [];
      const nextCalendarDays = currentCalendarDays.map((day) => {
        const templateIndex = (getDay(parseISO(day.date)) + 6) % 7;
        const templateDay = templateDays[templateIndex];

        if (!templateDay?.isEnabled) return clearSelectedDay(day);
        if (day.isExisting) return { ...day, isSelected: true };

        return applyDraftToDay(
          { ...day, isSelected: true },
          {
            scheduleStart: templateDay.startAt,
            scheduleEnd: templateDay.endAt,
            breaks: cloneBreaks(templateDay.breaks),
          },
        );
      });

      const templateEditableDays = nextCalendarDays.filter(
        (day) => day.isSelected && !day.isExisting,
      );

      setValue("calendarDays", nextCalendarDays, {
        shouldDirty: templateEditableDays.length > 0,
      });
      setValue("commonDraft", createDraftFromDay(templateEditableDays[0]));
      setValue(
        "mode",
        areUniformDays(templateEditableDays) ? "bulk" : "perDay",
      );
    },
    [getValues, setValue],
  );

  useEffect(() => {
    const monthKey = format(current, "yyyy-MM");
    const monthChanged = previousMonthKeyRef.current !== monthKey;
    previousMonthKeyRef.current = monthKey;

    if (!isDirtyRef.current || monthChanged) {
      reset(initialFormValues);
    }
  }, [current, initialFormValues, reset]);

  useEffect(() => {
    if (watchedMode !== "bulk") return;

    const currentCalendarDays = getValues("calendarDays") ?? [];
    const nextCalendarDays = currentCalendarDays.map((day) =>
      day.isSelected && !day.isExisting
        ? applyDraftToDay(day, watchedCommonDraft)
        : day,
    );

    if (!areSameCalendarDays(currentCalendarDays, nextCalendarDays)) {
      setValue("calendarDays", nextCalendarDays, {
        shouldDirty: editableSelectedDays.length > 0,
      });
    }
  }, [
    editableSelectedDays.length,
    getValues,
    setValue,
    watchedCommonDraft,
    watchedMode,
  ]);

  useEffect(() => {
    if (intent?.type !== "openTemplate") return;
    if (!isLoaded) return;
    if (workingDaysData === undefined) return;

    const templateConfigured = initialValues.days.some((day) => day.isEnabled);

    if (!templateConfigured) {
      setModalTemplate(true);
      dispatch(setScheduleIntent(null));
      return;
    }

    applyTemplateDays(initialValues.days);
    dispatch(setScheduleIntent(null));
  }, [
    applyTemplateDays,
    dispatch,
    initialValues.days,
    intent,
    isLoaded,
    workingDaysData,
  ]);

  return {
    methods,
    handleSubmit,
    calendarDays,
    appointmentDates,
    modalVisible,
    modalTemplate,
    setModalTemplate,
    isSaving,
    hasPendingEditableSelection,
    clearSelection,
    toggleDay,
    handleSave,
    applyTemplateDays,
  };
};
