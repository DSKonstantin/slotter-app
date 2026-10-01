import { useCallback, useMemo } from "react";
import { useFocusEffect } from "expo-router";
import { addDays, subDays } from "date-fns";
import { skipToken } from "@reduxjs/toolkit/query";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useScheduleTemplate } from "@/src/hooks/useScheduleTemplate";
import { useGetWorkingDaysQuery } from "@/src/store/redux/services/api/workingDaysApi";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { getTemplateRanges, getWorkingRanges } from "./utils";

const DAYS_BACK = 28;
const DAYS_AHEAD = 56;

export const useWorkingRanges = () => {
  const auth = useRequiredAuth();
  const {
    initialValues: template,
    reload: reloadTemplate,
    isLoaded: isTemplateLoaded,
  } = useScheduleTemplate();
  const today = new Date();

  const { data, isLoading, refetch } = useGetWorkingDaysQuery(
    auth
      ? {
          userId: auth.userId,
          date_from: formatApiDate(subDays(today, DAYS_BACK)),
          date_to: formatApiDate(addDays(today, DAYS_AHEAD)),
        }
      : skipToken,
  );

  const ranges = useMemo(
    () =>
      getWorkingRanges(
        Object.values(data ?? {}).filter(
          (wd): wd is NonNullable<typeof wd> => wd != null && wd.is_active,
        ),
        getTemplateRanges(template.days),
      ),
    [data, template.days],
  );

  useFocusEffect(
    useCallback(() => {
      reloadTemplate();
    }, [reloadTemplate]),
  );

  return { ranges, isLoading: isLoading || !isTemplateLoaded, refetch };
};
