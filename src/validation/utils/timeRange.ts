import * as Yup from "yup";
import { parseTimeToMinutes } from "./parseTimeToMinutes";

export const isEndAfterStart = (startAt?: string, endAt?: string): boolean => {
  if (!startAt || !endAt) return true;

  const start = parseTimeToMinutes(startAt);
  const end = parseTimeToMinutes(endAt);

  if (start === null || end === null) return false;

  return end > start;
};

export const withEndAfterStart = <T extends Yup.AnySchema>(
  schema: T,
  startFieldName = "startAt",
): T =>
  schema.test(
    "end-after-start",
    "Время окончания должно быть позже начала",
    (endAt, ctx) =>
      isEndAfterStart(ctx.parent[startFieldName], endAt as string),
  ) as T;

type BreakItem = { start?: string; end?: string };

const isWithinDay = (
  start: string | undefined,
  end: string | undefined,
  dayStart: string | undefined,
  dayEnd: string | undefined,
): boolean => {
  if (!start || !end || !dayStart || !dayEnd) return true;
  const s = parseTimeToMinutes(start);
  const e = parseTimeToMinutes(end);
  const ds = parseTimeToMinutes(dayStart);
  const de = parseTimeToMinutes(dayEnd);
  if (s === null || e === null || ds === null || de === null) return true;
  return s >= ds && e <= de;
};

const overlapsOther = (current: BreakItem, others: BreakItem[]): boolean => {
  const cs = parseTimeToMinutes(current.start ?? "");
  const ce = parseTimeToMinutes(current.end ?? "");
  if (cs === null || ce === null) return false;

  return others.some((other) => {
    if (other === current) return false;
    const os = parseTimeToMinutes(other.start ?? "");
    const oe = parseTimeToMinutes(other.end ?? "");
    if (os === null || oe === null) return false;
    return cs < oe && ce > os;
  });
};

type BreakSchemaOptions = {
  startFieldName?: string;
  endFieldName?: string;
};

const buildBreakSchema = ({
  startFieldName = "startAt",
  endFieldName = "endAt",
}: BreakSchemaOptions = {}) =>
  Yup.object().shape({
    start: Yup.string().required("Укажите время начала перерыва"),
    end: withEndAfterStart(
      Yup.string().required("Укажите время окончания перерыва"),
      "start",
    )
      .test("within-day", "Перерыв вне рабочего времени", (end, ctx) => {
        const day = ctx.from?.[1]?.value as Record<string, unknown> | undefined;
        if (!day) return true;
        return isWithinDay(
          ctx.parent.start,
          end as string | undefined,
          day[startFieldName] as string | undefined,
          day[endFieldName] as string | undefined,
        );
      })
      .test("no-overlap", "Перерывы пересекаются", (_end, ctx) => {
        const day = ctx.from?.[1]?.value as
          | { breaks?: BreakItem[] }
          | undefined;
        if (!day?.breaks) return true;
        return !overlapsOther(ctx.parent as BreakItem, day.breaks);
      }),
  });

export const breakSchema = buildBreakSchema();

export const breakWithIdSchema = breakSchema.shape({
  id: Yup.number().optional(),
});

export const EMPTY_WORKING_HOURS = {
  startAt: "",
  endAt: "",
  breaks: [] as { start: string; end: string }[],
};

type BreaksFieldOptions = {
  itemSchema?: Yup.AnySchema;
  startFieldName?: string;
  endFieldName?: string;
};

export const breaksField = ({
  itemSchema,
  startFieldName = "startAt",
  endFieldName = "endAt",
}: BreaksFieldOptions = {}) => {
  const schema =
    itemSchema ?? buildBreakSchema({ startFieldName, endFieldName });
  return Yup.array().of(schema).required().default([]);
};

export const areBreaksValid = (
  breaks: { start: string; end: string }[] = [],
  startAt?: string,
  endAt?: string,
): boolean => {
  if (breaks.length === 0) return true;
  if (!startAt || !endAt) return true;

  const dayStart = parseTimeToMinutes(startAt);
  const dayEnd = parseTimeToMinutes(endAt);

  if (dayStart === null || dayEnd === null || dayEnd <= dayStart) return false;

  const sorted = breaks
    .map((item) => ({
      start: parseTimeToMinutes(item.start),
      end: parseTimeToMinutes(item.end),
    }))
    .sort((a, b) => (a.start ?? 0) - (b.start ?? 0));

  return sorted.every((item, index) => {
    if (item.start === null || item.end === null) return false;
    if (item.end <= item.start) return false;
    if (item.start < dayStart || item.end > dayEnd) return false;

    const prev = sorted[index - 1];
    if (!prev || prev.end === null) return true;

    return item.start >= prev.end;
  });
};
