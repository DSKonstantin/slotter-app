import { useCallback, useState } from "react";
import { eachDayOfInterval, endOfMonth, getDay, startOfMonth } from "date-fns";

import { useBulkCreateWorkingDaysMutation } from "@/src/store/redux/services/api/workingDaysApi";
import { formatApiDate } from "@/src/utils/date/formatDate";
import type { ScheduleTemplateFormValues } from "@/src/validation/schemas/scheduleTemplate.schema";

// date-fns getDay(): 0=Sun, 1=Mon...6=Sat → template index (0=Mon...6=Sun): (jsDay + 6) % 7
const toTemplateIndex = (date: Date) => (getDay(date) + 6) % 7;

export const useApplyScheduleTemplate = (userId: number) => {
  const [bulkCreate] = useBulkCreateWorkingDaysMutation();
  const [isLoading, setIsLoading] = useState(false);

  const apply = useCallback(
    async (values: ScheduleTemplateFormValues, month: Date) => {
      const allDays = eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month),
      });

      const working_days = allDays.flatMap((date) => {
        const template = values.days[toTemplateIndex(date)];
        if (!template.isEnabled || !template.startAt || !template.endAt) {
          return [];
        }
        return [
          {
            day: formatApiDate(date),
            start_at: template.startAt,
            end_at: template.endAt,
            working_day_breaks: template.breaks.map((b) => ({
              start_at: b.start,
              end_at: b.end,
            })),
          },
        ];
      });

      if (working_days.length === 0) return;

      setIsLoading(true);
      try {
        await bulkCreate({ userId, working_days }).unwrap();
      } finally {
        setIsLoading(false);
      }
    },
    [bulkCreate, userId],
  );

  return { apply, isLoading };
};
