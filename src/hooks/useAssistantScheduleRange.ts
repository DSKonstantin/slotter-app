import { useMemo } from "react";
import { addDays } from "date-fns";
import { formatApiDate } from "@/src/utils/date/formatDate";
import { useToday } from "@/src/hooks/useToday";

type AssistantScheduleRange = {
  today: string;
  rangeEnd: string;
};

export const useAssistantScheduleRange = (): AssistantScheduleRange => {
  const today = useToday();
  return useMemo(
    () => ({
      today: formatApiDate(today),
      rangeEnd: formatApiDate(addDays(today, 7)),
    }),
    [today],
  );
};
