import {
  appointmentStepToMinutes,
  formatInterval,
} from "@/src/constants/bookingSteps";

describe("bookingSteps", () => {
  it("maps every step to its minute value", () => {
    expect(appointmentStepToMinutes("five_minutes")).toBe(5);
    expect(appointmentStepToMinutes("ten_minutes")).toBe(10);
    expect(appointmentStepToMinutes("fifteen_minutes")).toBe(15);
    expect(appointmentStepToMinutes("thirty_minutes")).toBe(30);
    expect(appointmentStepToMinutes("one_hour")).toBe(60);
  });

  it("formats intervals as minutes or hours", () => {
    expect(formatInterval(5)).toBe("5 мин");
    expect(formatInterval(30)).toBe("30 мин");
    expect(formatInterval(60)).toBe("1 час");
    expect(formatInterval(120)).toBe("2 часа");
    expect(formatInterval(240)).toBe("4 часа");
  });
});
