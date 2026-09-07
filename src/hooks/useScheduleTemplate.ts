import { useCallback, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  ScheduleTemplateSchema,
  type ScheduleTemplateFormValues,
} from "@/src/validation/schemas/scheduleTemplate.schema";

const STORAGE_KEY = "schedule_template";

const defaultValues =
  ScheduleTemplateSchema.getDefault() as ScheduleTemplateFormValues;

export const useScheduleTemplate = () => {
  const [initialValues, setInitialValues] =
    useState<ScheduleTemplateFormValues>(defaultValues);
  const [isLoaded, setIsLoaded] = useState(false);

  const save = useCallback(async (values: ScheduleTemplateFormValues) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((raw) => {
      if (raw) {
        try {
          setInitialValues(JSON.parse(raw));
        } catch {}
      }
      setIsLoaded(true);
    });
  }, []);

  return { initialValues, save, isLoaded };
};
