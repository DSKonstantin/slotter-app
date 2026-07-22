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

export type BreakItem = { start?: string; end?: string };

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

export const overlapsOther = (
  current: BreakItem,
  others: BreakItem[],
): boolean => {
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

export const BREAKS_OVERLAP_MESSAGE = "Перерывы не должны пересекаться";

const buildBreakSchema = ({
  startFieldName = "startAt",
  endFieldName = "endAt",
}: BreakSchemaOptions = {}) =>
  Yup.object().shape({
    start: Yup.string()
      .required("Укажите время начала перерыва")
      .test("no-overlap", BREAKS_OVERLAP_MESSAGE, (_start, ctx) => {
        const day = ctx.from?.[1]?.value as
          | { breaks?: BreakItem[] }
          | undefined;
        if (!day?.breaks) return true;
        return !overlapsOther(ctx.parent as BreakItem, day.breaks);
      }),
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
      .test("no-overlap", BREAKS_OVERLAP_MESSAGE, (_end, ctx) => {
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
