import { broadcastCreateSchema } from "@/src/validation/schemas/broadcastCreate.schema";

const base = {
  name: "Летняя акция",
  message: "Скидка 20% до конца месяца",
  onlyConsented: true,
  isScheduled: false,
  channel: "auto",
};

const scheduled = {
  ...base,
  isScheduled: true,
  scheduledDate: { from: "2026-09-10", to: "2026-09-12" },
  scheduledTime: 600,
};

describe("broadcastCreateSchema", () => {
  it("accepts a valid non-scheduled broadcast", () => {
    expect(broadcastCreateSchema.isValidSync(base)).toBe(true);
  });

  it("accepts a valid scheduled broadcast", () => {
    expect(broadcastCreateSchema.isValidSync(scheduled)).toBe(true);
  });

  it("requires a non-blank name and message", () => {
    expect(broadcastCreateSchema.isValidSync({ ...base, name: "" })).toBe(
      false,
    );
    expect(broadcastCreateSchema.isValidSync({ ...base, name: "   " })).toBe(
      false,
    );
    expect(broadcastCreateSchema.isValidSync({ ...base, message: "" })).toBe(
      false,
    );
  });

  it("leaves channel optional", () => {
    expect(
      broadcastCreateSchema.isValidSync({
        name: base.name,
        message: base.message,
        onlyConsented: base.onlyConsented,
        isScheduled: false,
      }),
    ).toBe(true);
  });

  describe("when isScheduled is true", () => {
    const noDate = { ...base, isScheduled: true, scheduledTime: 600 };
    const noTime = {
      ...base,
      isScheduled: true,
      scheduledDate: { from: "2026-09-10", to: "2026-09-12" },
    };

    it("rejects a missing scheduledDate with «Укажите период»", () => {
      expect(broadcastCreateSchema.isValidSync(noDate)).toBe(false);
      expect(
        broadcastCreateSchema.isValidSync({ ...noDate, scheduledDate: null }),
      ).toBe(false);
      expect(() => broadcastCreateSchema.validateSync(noDate)).toThrow(
        "Укажите период",
      );
    });

    it("requires both endpoints of scheduledDate", () => {
      expect(
        broadcastCreateSchema.isValidSync({
          ...scheduled,
          scheduledDate: { from: "2026-09-10" },
        }),
      ).toBe(false);
    });

    it("rejects a missing scheduledTime with «Укажите время»", () => {
      expect(broadcastCreateSchema.isValidSync(noTime)).toBe(false);
      expect(() => broadcastCreateSchema.validateSync(noTime)).toThrow(
        "Укажите время",
      );
    });
  });

  describe("when isScheduled is false", () => {
    it("ignores scheduledDate and scheduledTime", () => {
      expect(
        broadcastCreateSchema.isValidSync({ ...base, scheduledDate: null }),
      ).toBe(true);
      expect(
        broadcastCreateSchema.isValidSync({
          ...base,
          scheduledDate: undefined,
          scheduledTime: undefined,
        }),
      ).toBe(true);
    });
  });
});
