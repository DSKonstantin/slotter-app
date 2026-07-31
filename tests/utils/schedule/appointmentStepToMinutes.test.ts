import { appointmentStepToMinutes } from "@/src/utils/schedule/appointmentStepToMinutes";

describe("appointmentStepToMinutes", () => {
  it("maps every step to its minute value", () => {
    expect(appointmentStepToMinutes("five_minutes")).toBe(5);
    expect(appointmentStepToMinutes("ten_minutes")).toBe(10);
    expect(appointmentStepToMinutes("fifteen_minutes")).toBe(15);
    expect(appointmentStepToMinutes("thirty_minutes")).toBe(30);
    expect(appointmentStepToMinutes("one_hour")).toBe(60);
  });
});
