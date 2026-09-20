import { addDays, parseISO } from "date-fns";

import { formatApiDate } from "@/src/utils/date/formatDate";
import { colors } from "@/src/styles/colors";

export function buildRangeMarks(start: string | null, end: string | null) {
  const marks: Record<string, object> = {};
  if (!start) return marks;

  marks[start] = { selected: true, selectedColor: colors.primary.blue[500] };

  if (!end || end === start) return marks;

  const today = formatApiDate(new Date());
  let current = formatApiDate(addDays(parseISO(start), 1));

  while (current < end) {
    marks[current] = {
      selected: true,
      selectedColor: colors.primary.blue[100],
      selectedTextColor:
        current === today ? colors.primary.blue[500] : colors.neutral[900],
    };
    current = formatApiDate(addDays(parseISO(current), 1));
  }

  marks[end] = { selected: true, selectedColor: colors.primary.blue[500] };

  return marks;
}
