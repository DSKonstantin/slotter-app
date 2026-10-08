import { configureStore } from "@reduxjs/toolkit";

import { analyticsListener } from "@/src/store/redux/analyticsListener";

const mockReportEvent = jest.fn();

jest.mock("@/src/services/appMetrica", () => ({
  reportEvent: (name: string, params?: unknown) =>
    mockReportEvent(name, params),
}));

const buildStore = () =>
  configureStore({
    reducer: (state = {}) => state,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(analyticsListener.middleware),
  });

const fulfilled = (
  endpointName: string,
  type: "mutation" | "query" = "mutation",
  originalArgs?: unknown,
  payload: unknown = {},
) => ({
  type: `api/execute${type === "mutation" ? "Mutation" : "Query"}/fulfilled`,
  payload,
  meta: {
    arg: { type, endpointName, originalArgs },
    requestId: "id",
    requestStatus: "fulfilled",
  },
});

beforeEach(() => {
  mockReportEvent.mockClear();
});

describe("analyticsListener — simple events", () => {
  it.each([
    ["cancelSubscription", "subscription_cancel"],
    ["createAppointment", "appointment_created"],
    ["confirmAppointment", "appointment_confirmed"],
    ["arriveAppointment", "appointment_arrived"],
    ["completeAppointment", "appointment_completed"],
    ["cancelAppointment", "appointment_cancelled"],
    ["rescheduleAppointment", "appointment_rescheduled"],
    ["markMissedAppointment", "appointment_missed"],
  ])("reports %s as %s", (endpointName, event) => {
    buildStore().dispatch(fulfilled(endpointName));

    expect(mockReportEvent).toHaveBeenCalledTimes(1);
    expect(mockReportEvent).toHaveBeenCalledWith(event, undefined);
  });
});

describe("analyticsListener — events with parameters", () => {
  it("reports a password login with its method", () => {
    buildStore().dispatch(fulfilled("login"));

    expect(mockReportEvent).toHaveBeenCalledWith("login", {
      method: "password",
    });
  });

  it("reports a finished password reset only when authorized", () => {
    const store = buildStore();

    store.dispatch(
      fulfilled("resetPassword", "mutation", {}, { status: "authorized" }),
    );
    expect(mockReportEvent).toHaveBeenCalledWith("password_reset", undefined);

    mockReportEvent.mockClear();
    store.dispatch(
      fulfilled("resetPassword", "mutation", {}, { status: "pending" }),
    );
    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("reports the checkout start with the price id", () => {
    buildStore().dispatch(
      fulfilled("checkout", "mutation", { subscriptionPlanPriceId: 12 }),
    );

    expect(mockReportEvent).toHaveBeenCalledWith(
      "subscription_checkout_started",
      { price_id: 12 },
    );
  });

  it("reports the onboarding step from a plain update", () => {
    buildStore().dispatch(
      fulfilled("updateUser", "mutation", {
        id: 1,
        data: { onboarding_step: "service" },
      }),
    );

    expect(mockReportEvent).toHaveBeenCalledWith("onboarding_step", {
      step: "service",
    });
  });

  it("reports the onboarding step from a form data update", () => {
    const formData = {
      _parts: [
        ["user[first_name]", "Анна"],
        ["user[onboarding_step]", "service"],
      ],
    };

    buildStore().dispatch(
      fulfilled("updateUser", "mutation", { id: 1, data: formData }),
    );

    expect(mockReportEvent).toHaveBeenCalledWith("onboarding_step", {
      step: "service",
    });
  });

  it("ignores updates that do not touch onboarding", () => {
    const store = buildStore();

    store.dispatch(
      fulfilled("updateUser", "mutation", { id: 1, data: { first_name: "A" } }),
    );
    store.dispatch(
      fulfilled("updateUser", "mutation", { id: 1, data: { _parts: [] } }),
    );
    store.dispatch(fulfilled("updateUser", "mutation", { id: 1 }));

    expect(mockReportEvent).not.toHaveBeenCalled();
  });
});

describe("analyticsListener — what is not tracked", () => {
  it("no longer reports the credentials screen as a sign up", () => {
    buildStore().dispatch(fulfilled("updateCredentials"));

    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("leaves login by code to the screens that know the method and flow", () => {
    const store = buildStore();
    store.dispatch(fulfilled("confirmCode"));
    store.dispatch(fulfilled("sendCode"));

    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("ignores queries even with a tracked endpoint name", () => {
    buildStore().dispatch(fulfilled("login", "query"));

    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("ignores rejected and pending mutations", () => {
    const store = buildStore();
    store.dispatch({
      type: "api/executeMutation/rejected",
      meta: { arg: { type: "mutation", endpointName: "login" } },
    });
    store.dispatch({
      type: "api/executeMutation/pending",
      meta: { arg: { type: "mutation", endpointName: "login" } },
    });

    expect(mockReportEvent).not.toHaveBeenCalled();
  });

  it("ignores unrelated actions", () => {
    buildStore().dispatch({ type: "ui/something" });

    expect(mockReportEvent).not.toHaveBeenCalled();
  });
});
