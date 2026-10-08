import { createListenerMiddleware, isFulfilled } from "@reduxjs/toolkit";
import { reportEvent } from "@/src/services/appMetrica";

type TrackedEvent = { name: string; params?: Record<string, unknown> };

type MutationMeta = {
  arg?: { type?: string; endpointName?: string; originalArgs?: unknown };
};

const simple = (name: string) => (): TrackedEvent => ({ name });

const ONBOARDING_STEP_KEY = "user[onboarding_step]";

const readOnboardingStep = (data: unknown): string | undefined => {
  if (!data || typeof data !== "object") return undefined;

  const parts = (data as { _parts?: [string, unknown][] })._parts;
  if (Array.isArray(parts)) {
    const entry = parts.find(([key]) => key === ONBOARDING_STEP_KEY);
    return typeof entry?.[1] === "string" ? entry[1] : undefined;
  }

  const step = (data as { onboarding_step?: unknown }).onboarding_step;
  return typeof step === "string" ? step : undefined;
};

const HANDLERS: Record<
  string,
  (args: any, payload: any) => TrackedEvent | null
> = {
  login: () => ({ name: "login", params: { method: "password" } }),
  resetPassword: (_args, payload) =>
    payload?.status === "authorized" ? { name: "password_reset" } : null,
  updateUser: (args) => {
    const step = readOnboardingStep(args?.data);
    return step ? { name: "onboarding_step", params: { step } } : null;
  },
  checkout: (args) => ({
    name: "subscription_checkout_started",
    params: { price_id: args?.subscriptionPlanPriceId },
  }),
  cancelSubscription: simple("subscription_cancel"),
  createAppointment: simple("appointment_created"),
  confirmAppointment: simple("appointment_confirmed"),
  arriveAppointment: simple("appointment_arrived"),
  completeAppointment: simple("appointment_completed"),
  cancelAppointment: simple("appointment_cancelled"),
  rescheduleAppointment: simple("appointment_rescheduled"),
  markMissedAppointment: simple("appointment_missed"),
};

export const analyticsListener = createListenerMiddleware();

analyticsListener.startListening({
  predicate: (action) => {
    if (!isFulfilled(action)) return false;
    const meta = action.meta as MutationMeta;
    return (
      meta.arg?.type === "mutation" && !!HANDLERS[meta.arg.endpointName ?? ""]
    );
  },
  effect: (action) => {
    const meta = action.meta as MutationMeta;
    const handler = HANDLERS[meta.arg!.endpointName!];
    const event = handler(meta.arg!.originalArgs, action.payload);
    if (event) reportEvent(event.name, event.params);
  },
});
