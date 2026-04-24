import { useEffect, useState } from "react";

import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { setScheduleIntent } from "@/src/store/redux/slices/calendarSlice";
import { useScheduleTemplate } from "@/src/hooks/useScheduleTemplate";

import { useCalendarData } from "./useCalendarData";
import { useCalendarForm } from "./useCalendarForm";
import { useCalendarActions } from "./useCalendarActions";

export const useCalendarSchedule = (current: Date) => {
  const dispatch = useAppDispatch();
  const intent = useAppSelector((state) => state.calendar.scheduleIntent);
  const { initialValues: templateValues, isLoaded: isTemplateLoaded } =
    useScheduleTemplate();

  const [modalTemplate, setModalTemplate] = useState(false);

  const { auth, workingDaysData, appointmentDates, initialFormValues } =
    useCalendarData(current);

  const {
    methods,
    watchedMode,
    watchedCommonDraft,
    calendarDays,
    editableSelectedDays,
    hasPendingEditableSelection,
    modalVisible,
  } = useCalendarForm(current, initialFormValues);

  const {
    handleSubmit,
    isSaving,
    clearSelection,
    toggleDay,
    handleSave,
    applyTemplateDays,
  } = useCalendarActions({
    methods,
    auth,
    initialFormValues,
    watchedMode,
    watchedCommonDraft,
    editableSelectedDays,
  });

  // Handle template intent from external navigation
  useEffect(() => {
    if (intent?.type !== "openTemplate") return;
    if (!isTemplateLoaded) return;
    if (workingDaysData === undefined) return;

    const templateConfigured = templateValues.days.some(
      (day) => day.isEnabled,
    );

    if (!templateConfigured) {
      // setModalTemplate(true);
      dispatch(setScheduleIntent(null));
      return;
    }

    applyTemplateDays(templateValues.days);
    dispatch(setScheduleIntent(null));
  }, [
    applyTemplateDays,
    dispatch,
    templateValues.days,
    intent,
    isTemplateLoaded,
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
