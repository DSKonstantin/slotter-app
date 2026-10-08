import {
  trackAuthCodeFailed,
  trackAuthFallbackToCall,
  trackAuthMethodPicked,
  trackAuthSuccess,
} from "@/src/services/analytics";

const mockReportEvent = jest.fn();

jest.mock("@/src/services/appMetrica", () => ({
  reportEvent: (name: string, params?: unknown) =>
    mockReportEvent(name, params),
}));

beforeEach(() => {
  mockReportEvent.mockClear();
});

describe("analytics", () => {
  it("reports the picked auth method with the flow", () => {
    trackAuthMethodPicked("telegram", "reset");

    expect(mockReportEvent).toHaveBeenCalledWith("auth_method_picked", {
      method: "telegram",
      flow: "reset",
    });
  });

  it("reports a failed code with the reason", () => {
    trackAuthCodeFailed("flashcall", "login", "wrong_code");

    expect(mockReportEvent).toHaveBeenCalledWith("auth_code_failed", {
      method: "flashcall",
      flow: "login",
      reason: "wrong_code",
    });
  });

  it("reports the fallback to a call and where it came from", () => {
    trackAuthFallbackToCall("telegram", "login");

    expect(mockReportEvent).toHaveBeenCalledWith("auth_fallback_to_call", {
      from: "telegram",
      flow: "login",
    });
  });
});

describe("trackAuthSuccess", () => {
  it("reports a sign up for a newly created account", () => {
    trackAuthSuccess({ method: "telegram", flow: "login", isCreated: true });

    expect(mockReportEvent).toHaveBeenCalledWith("sign_up", {
      method: "telegram",
    });
  });

  it("reports a login for an existing account", () => {
    trackAuthSuccess({ method: "callback", flow: "login", isCreated: false });

    expect(mockReportEvent).toHaveBeenCalledWith("login", {
      method: "callback",
    });
  });

  it("stays silent in the password reset flow", () => {
    trackAuthSuccess({ method: "telegram", flow: "reset", isCreated: false });
    trackAuthSuccess({ method: "telegram", flow: "reset", isCreated: true });

    expect(mockReportEvent).not.toHaveBeenCalled();
  });
});
