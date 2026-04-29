import * as Yup from "yup";
import { parseTimeToMinutes } from "./parseTimeToMinutes";

export const isEndAfterStart = (startAt?: string, endAt?: string): boolean => {
  if (!startAt || !endAt) return true;

  const start = parseTimeToMinutes(startAt);
  const end = parseTimeToMinutes(endAt);

  if (start === null || end === null) return false;

  return end > start;
};

export const breakSchema = Yup.object().shape({
  start: Yup.string().required(),
  end: Yup.string().required(),
});

export const breakWithIdSchema = breakSchema.shape({
  id: Yup.number().optional(),
});

export const EMPTY_WORKING_HOURS = {
  startAt: "",
  endAt: "",
  breaks: [] as { start: string; end: string }[],
};

export const withEndAfterStart = <T extends Yup.AnySchema>(
  schema: T,
  startFieldName = "startAt",
): T =>
  schema.test(
    "end-after-start",
    "Время окончания должно быть позже начала",
    (endAt, ctx) => isEndAfterStart(ctx.parent[startFieldName], endAt as string),
  ) as T;

type BreaksFieldOptions = {
  itemSchema?: Yup.AnySchema;
  startFieldName?: string;
  endFieldName?: string;
};

export const breaksField = ({
  itemSchema = breakSchema,
  startFieldName = "startAt",
  endFieldName = "endAt",
}: BreaksFieldOptions = {}) =>
  Yup.array()
    .of(itemSchema)
    .required()
    .default([])
    .test("valid-breaks", "Проверьте перерывы", (breaks, context) =>
      areBreaksValid(
        breaks as { start: string; end: string }[],
        context.parent[startFieldName],
        context.parent[endFieldName],
      ),
    );

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
