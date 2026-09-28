import { buildMinuteOptions } from "@/src/utils/date/timeOptions";
import { formatMinutes, parseTime } from "@/src/utils/date/formatTime";
import { MOCK_WORKING_DAY } from "./constants";

const WORKING_DAY_RANGE = {
  start: parseTime(MOCK_WORKING_DAY.start),
  end: parseTime(MOCK_WORKING_DAY.end),
  exclude: [
    {
      startMinutes: parseTime(MOCK_WORKING_DAY.breakStart),
      endMinutes: parseTime(MOCK_WORKING_DAY.breakEnd),
    },
  ],
};

export const EMPTY_TIMES: number[] = [];

export const buildGrid = (step: number) =>
  buildMinuteOptions({ ...WORKING_DAY_RANGE, step });

export const buildGridItems = (step: number) =>
  buildGrid(step).map((t) => ({ value: t, label: formatMinutes(t) }));

export const toggleItem = <T>(list: T[], item: T) =>
  list.includes(item) ? list.filter((i) => i !== item) : [...list, item];

export const sortMinutes = (times: number[]) =>
  [...times].sort((a, b) => a - b);
