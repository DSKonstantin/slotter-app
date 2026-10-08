import { reportEvent } from "@/src/services/appMetrica";

export type AnalyticsFlow = "login" | "reset";
export type AnalyticsAuthMethod =
  "telegram" | "flashcall" | "callback" | "password";

export const trackAuthMethodPicked = (
  method: AnalyticsAuthMethod,
  flow: AnalyticsFlow,
) => reportEvent("auth_method_picked", { method, flow });

export const trackAuthCodeFailed = (
  method: AnalyticsAuthMethod,
  flow: AnalyticsFlow,
  reason: string,
) => reportEvent("auth_code_failed", { method, flow, reason });

export const trackAuthFallbackToCall = (
  from: AnalyticsAuthMethod,
  flow: AnalyticsFlow,
) => reportEvent("auth_fallback_to_call", { from, flow });

export const trackAuthSuccess = ({
  method,
  flow,
  isCreated,
}: {
  method: AnalyticsAuthMethod;
  flow: AnalyticsFlow;
  isCreated: boolean;
}) => {
  if (flow !== "login") return;
  reportEvent(isCreated ? "sign_up" : "login", { method });
};
