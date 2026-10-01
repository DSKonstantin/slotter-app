import {
  bookingFixedTimeFromApi,
  bookingFixedTimeToApi,
  DEFAULT_BOOKING_FIXED_TIME,
} from "@/src/utils/bookingFixedTimeApi";
import type { BookingFixedTimeApi } from "@/src/store/redux/services/api-types";

const api: BookingFixedTimeApi = {
  enabled: true,
  mode: "weekly",
  interval: "one_hour",
  fixed_times: ["13:00", "11:30"],
  days: ["mon", "tue"],
  day_times: { mon: ["10:30"], tue: ["11:00", "09:00"] },
};

describe("bookingFixedTimeApi", () => {
  it("returns defaults when the field is missing", () => {
    expect(bookingFixedTimeFromApi(undefined)).toEqual(
      DEFAULT_BOOKING_FIXED_TIME,
    );
  });

  it("maps api values to minutes and sorts times", () => {
    expect(bookingFixedTimeFromApi(api)).toEqual({
      enabled: true,
      mode: "weekly",
      interval: 60,
      fixedTimes: [690, 780],
      days: ["mon", "tue"],
      dayTimes: { mon: [630], tue: [540, 660] },
    });
  });

  it("round-trips back to api format", () => {
    expect(bookingFixedTimeToApi(bookingFixedTimeFromApi(api))).toEqual({
      ...api,
      fixed_times: ["11:30", "13:00"],
      day_times: { mon: ["10:30"], tue: ["09:00", "11:00"] },
    });
  });
});
