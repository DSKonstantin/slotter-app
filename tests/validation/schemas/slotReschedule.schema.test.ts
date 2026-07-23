import { RescheduleSchema } from "@/src/validation/schemas/slotReschedule.schema";

const valid = {
  date: "2026-07-22",
  start_time: "14:30",
  reason: "",
  send_notification: true,
};

describe("RescheduleSchema", () => {
  it("accepts a fully valid payload", () => {
    expect(RescheduleSchema.isValidSync(valid)).toBe(true);
  });

  it("requires the date to be in YYYY-MM-DD format", () => {
    expect(RescheduleSchema.isValidSync({ ...valid, date: "22-07-2026" })).toBe(
      false,
    );
    expect(RescheduleSchema.isValidSync({ ...valid, date: "" })).toBe(false);
  });

  it("requires start_time and send_notification", () => {
    expect(RescheduleSchema.isValidSync({ ...valid, start_time: "" })).toBe(
      false,
    );
    expect(
      RescheduleSchema.isValidSync({ ...valid, send_notification: undefined }),
    ).toBe(false);
  });

  it("leaves reason optional", () => {
    expect(
      RescheduleSchema.isValidSync({
        date: valid.date,
        start_time: valid.start_time,
        send_notification: valid.send_notification,
      }),
    ).toBe(true);
  });
});
