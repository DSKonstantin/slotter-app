import { buildOutsideHoursMessage } from "@/src/utils/bookingFixedTimeConfirm";

describe("buildOutsideHoursMessage", () => {
  it("uses singular wording for 1 and 21", () => {
    expect(buildOutsideHoursMessage(1)).toBe(
      "1 фиксированное время выйдет за пределы нового графика и перестанет предлагаться клиентам",
    );
    expect(buildOutsideHoursMessage(21)).toContain(
      "21 фиксированное время выйдет",
    );
  });

  it("uses the few form for 2-4", () => {
    expect(buildOutsideHoursMessage(2)).toBe(
      "2 фиксированных времени выйдут за пределы нового графика и перестанут предлагаться клиентам",
    );
  });

  it("uses the many form for 5 and 11", () => {
    expect(buildOutsideHoursMessage(5)).toContain(
      "5 фиксированных времён выйдут",
    );
    expect(buildOutsideHoursMessage(11)).toContain(
      "11 фиксированных времён выйдут",
    );
  });
});
