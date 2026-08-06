import { useMemo } from "react";
import { addDays } from "date-fns";
import { formatApiDate } from "@/src/utils/date/formatDate";

type AssistantScheduleRange = {
  today: string;
  rangeEnd: string;
};

export const useAssistantScheduleRange = (): AssistantScheduleRange =>
  useMemo(() => {
    const now = new Date();
    return {
      today: formatApiDate(now),
      rangeEnd: formatApiDate(addDays(now, 7)),
    };
  }, []);
