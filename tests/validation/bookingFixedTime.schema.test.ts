import { bookingFixedTimeSchema } from "@/src/validation/schemas/bookingFixedTime.schema";
import {
  collectOffGridTimes,
  dropOffGridTimes,
} from "@/src/components/app/account/bookingFixedTime/utils";
import type { BookingFixedTimeSettings } from "@/src/utils/bookingFixedTime";

const values = (
  overrides: Partial<BookingFixedTimeSettings> = {},
): BookingFixedTimeSettings => ({
  enabled: true,
  mode: "fixed",
  interval: 30,
  fixedTimes: [600],
  days: [],
  dayTimes: {},
  ...overrides,
});

const errorOf = async (v: BookingFixedTimeSettings) => {
  try {
    await bookingFixedTimeSchema.validate(v);
    return null;
  } catch (e) {
    return (e as { path: string; message: string }).path;
  }
};

describe("bookingFixedTimeSchema", () => {
  it("accepts a valid fixed config", async () => {
    expect(await errorOf(values())).toBeNull();
  });

  it("requires a time in fixed mode when enabled", async () => {
    expect(await errorOf(values({ fixedTimes: [] }))).toBe("fixedTimes");
  });

  it("allows empty lists when disabled", async () => {
    expect(
      await errorOf(values({ enabled: false, fixedTimes: [] })),
    ).toBeNull();
  });

  it("requires a day in weekly mode", async () => {
    expect(await errorOf(values({ mode: "weekly", days: [] }))).toBe("days");
  });

  it("requires times for every selected day", async () => {
    expect(
      await errorOf(
        values({
          mode: "weekly",
          days: ["mon", "tue"],
          dayTimes: { mon: [600] },
        }),
      ),
    ).toBe("dayTimes");
  });

  it("ignores times of unselected days", async () => {
    expect(
      await errorOf(
        values({
          mode: "weekly",
          days: ["mon"],
          dayTimes: { mon: [600], tue: [] },
        }),
      ),
    ).toBeNull();
  });

  it("rejects off-grid times even when disabled", async () => {
    expect(await errorOf(values({ enabled: false, fixedTimes: [615] }))).toBe(
      "interval",
    );
  });
});

describe("off-grid helpers", () => {
  const lists = {
    fixedTimes: [660, 690],
    dayTimes: { mon: [690, 720], tue: [570] },
  };

  it("collects unique sorted off-grid times from both lists", () => {
    expect(collectOffGridTimes(lists, 60)).toEqual([570, 690]);
  });

  it("drops off-grid times from both lists", () => {
    expect(dropOffGridTimes(lists, 60)).toEqual({
      fixedTimes: [660],
      dayTimes: { mon: [720], tue: [] },
    });
  });
});

describe("bookingFixedTimeSchema with long intervals", () => {
  it("accepts any whole hour for a two-hour interval", async () => {
    expect(
      await errorOf(values({ interval: 120, fixedTimes: [540, 600] })),
    ).toBeNull();
  });

  it("rejects a time not on a whole hour for a long interval", async () => {
    expect(await errorOf(values({ interval: 120, fixedTimes: [630] }))).toBe(
      "interval",
    );
  });

  it("keeps whole hours when switching from one hour to three", () => {
    const lists = {
      fixedTimes: [600, 660, 780],
      dayTimes: { mon: [540] },
    };
    expect(collectOffGridTimes(lists, 180)).toEqual([]);
    expect(dropOffGridTimes(lists, 180)).toEqual(lists);
  });
});
