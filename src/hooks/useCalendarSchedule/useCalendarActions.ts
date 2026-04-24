import { useCallback, useEffect } from "react";
import { getDay, parseISO } from "date-fns";
import { toast } from "@backpackapp-io/react-native-toast";
import type { UseFormReturn } from "react-hook-form";

import { useBulkCreateWorkingDaysMutation } from "@/src/store/redux/services/api/workingDaysApi";
import type { CalendarScheduleFormValues } from "@/src/validation/schemas/calendarSchedule.schema";
import type { ScheduleTemplateFormValues } from "@/src/validation/schemas/scheduleTemplate.schema";
import { getApiErrorMessage } from "@/src/utils/apiError";
import {
  applyDraftToDay,
  areSameCalendarDays,
  areUniformDays,
  clearSelectedDay,
  cloneBreaks,
  createDraftFromDay,
} from "@/src/utils/calendar/scheduleHelpers";

type UseCalendarActionsParams = {
  methods: UseFormReturn<CalendarScheduleFormValues>;
  auth: { userId: number } | null;
  initialFormValues: CalendarScheduleFormValues;
  watchedMode: string;
  watchedCommonDraft: CalendarScheduleFormValues["commonDraft"];
  editableSelectedDays: { isSelected: boolean; isExisting: boolean }[];
};

export const useCalendarActions = ({
  methods,
  auth,
  initialFormValues,
  watchedMode,
  watchedCommonDraft,
  editableSelectedDays,
}: UseCalendarActionsParams) => {
  const { getValues, setValue, reset, handleSubmit } = methods;

  const [bulkCreateWorkingDays, { isLoading: isSaving }] =
    useBulkCreateWorkingDaysMutation();

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
        if (day.date !== dateKey) return day;
        if (day.isExisting) {
          return { ...day, isSelected: !day.isSelected };
        }
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

  // Sync commonDraft → calendarDays in bulk mode
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

  return {
    handleSubmit,
    isSaving,
    clearSelection,
    toggleDay,
    handleSave,
    applyTemplateDays,
  };
};
