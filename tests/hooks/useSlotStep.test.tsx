import React from "react";
import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { renderHook } from "@testing-library/react-native";

import authReducer, {
  type AuthState,
} from "@/src/store/redux/slices/authSlice";
import { useSlotStep } from "@/src/hooks/useSlotStep";
import type { AppointmentStep } from "@/src/utils/schedule/appointmentStepToMinutes";

const renderWithStep = (appointmentStep: AppointmentStep | undefined) => {
  const authState: AuthState = {
    token: null,
    user: appointmentStep
      ? ({ appointment_step: appointmentStep } as never)
      : null,
    resourceType: null,
    status: "idle",
  };
  const store = configureStore({
    reducer: { auth: authReducer },
    preloadedState: { auth: authState },
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(() => useSlotStep(), { wrapper });
};

describe("useSlotStep", () => {
  it("defaults to 60-minute steps (no hour grouping) when there is no user yet", async () => {
    const { result } = await renderWithStep(undefined);
    expect(result.current.stepMinutes).toBe(60);
    expect(result.current.useHourGrouping).toBe(false);
  });

  it("maps the user's appointment_step to minutes", async () => {
    const { result } = await renderWithStep("fifteen_minutes");
    expect(result.current.stepMinutes).toBe(15);
  });

  it("enables hour grouping only when the step is under an hour", async () => {
    expect(
      (await renderWithStep("thirty_minutes")).result.current.useHourGrouping,
    ).toBe(true);
    expect(
      (await renderWithStep("one_hour")).result.current.useHourGrouping,
    ).toBe(false);
  });
});
