import { useCallback, useState } from "react";

import {
  toRangeEndpoints,
  toggleRangeDay,
  type DateRange,
  type RangeEndpoints,
} from "@/src/utils/date/dateRange";

export type { DateRange } from "@/src/utils/date/dateRange";

export function useCalendarRange(initial?: DateRange | null) {
  const [{ start, end }, setState] = useState<RangeEndpoints>(() =>
    toRangeEndpoints(initial),
  );

  const onDayPress = useCallback((date: string) => {
    setState((r) => toggleRangeDay(r, date));
  }, []);

  const reset = useCallback(() => setState({ start: null, end: null }), []);

  const setRange = useCallback(
    (range?: DateRange | null) => setState(toRangeEndpoints(range)),
    [],
  );

  return { start, end, onDayPress, reset, setRange };
}
