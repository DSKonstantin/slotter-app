import { act, renderHook } from "@testing-library/react-native";

import { useRequestCode } from "@/src/components/auth/useRequestCode";
import { CODE_METHODS } from "@/src/components/auth/enterCode/codeMethods";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockTrackAuthCodeFailed = jest.fn();
const mockSendCode = jest.fn();
const mockToastError = jest.fn();

jest.mock("@/src/services/analytics", () => ({
  trackAuthCodeFailed: (...args: unknown[]) => mockTrackAuthCodeFailed(...args),
}));

jest.mock("@/src/store/redux/services/api/authApi", () => ({
  useSendCodeMutation: () => [mockSendCode],
}));

jest.mock("@/src/components/ui/toast", () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

const PHONE = "+79161234567";

const telegramResponse = (extra: Record<string, unknown> = {}) => ({
  method: "telegram",
  code_length: 6,
  resend_after: 30,
  expires_in: 600,
  is_code_sent: true,
  bot_url: "https://t.me/slotter_robot",
  ...extra,
});

const setup = (params: Record<string, unknown> = {}) => {
  const onAccountDeactivated = jest.fn();
  return renderHook(() =>
    useRequestCode({ onAccountDeactivated, ...params } as never),
  ).then((hook) => ({ ...hook, onAccountDeactivated }));
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("useRequestCode", () => {
  it("requests the method for the phone and returns the code screen route", async () => {
    mockSendCode.mockReturnValue(resolved(telegramResponse()));
    const { result } = await setup();

    let route: unknown;
    await act(async () => {
      route = await result.current.requestCode({
        phone: PHONE,
        method: "telegram",
        referralCode: "FRIEND",
      });
    });

    expect(mockSendCode).toHaveBeenCalledWith({
      phone: PHONE,
      type: "user",
      method: "telegram",
    });
    expect(route).toEqual({
      pathname: "/(auth)/enter-code",
      params: expect.objectContaining({
        phone: PHONE,
        method: "telegram",
        flow: "login",
        referralCode: "FRIEND",
        bot_url: "https://t.me/slotter_robot",
      }),
    });
  });

  it("routes to the password reset stack in the reset flow", async () => {
    mockSendCode.mockReturnValue(resolved(telegramResponse()));
    const { result } = await setup({ flow: "reset" });

    let route: { pathname: string; params: Record<string, string> };
    await act(async () => {
      route = (await result.current.requestCode({
        phone: PHONE,
        method: "telegram",
      })) as never;
    });

    expect(route!.pathname).toBe("/(password-reset)/enter-code");
    expect(route!.params.flow).toBe("reset");
  });

  it("marks the requested method as pending while the request runs", async () => {
    let finish: (value: unknown) => void = () => {};
    mockSendCode.mockReturnValue({
      unwrap: () => new Promise((resolve) => (finish = resolve)),
    });
    const { result } = await setup();
    expect(result.current.pendingMethod).toBeNull();

    let pending: Promise<unknown>;
    await act(async () => {
      pending = result.current.requestCode({
        phone: PHONE,
        method: "flashcall",
      });
    });
    expect(result.current.pendingMethod).toBe("flashcall");

    await act(async () => {
      finish(telegramResponse({ method: "flashcall" }));
      await pending;
    });
    expect(result.current.pendingMethod).toBeNull();
  });

  it("refuses a different method than the one that was requested", async () => {
    mockSendCode.mockReturnValue(
      resolved(telegramResponse({ method: "callback" })),
    );
    const { result } = await setup();

    let route: unknown = "unset";
    await act(async () => {
      route = await result.current.requestCode({
        phone: PHONE,
        method: "telegram",
      });
    });

    expect(route).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith(
      CODE_METHODS.telegram.unavailableText,
    );
  });

  it("opens the deactivated modal for a deactivated account", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { code: "account_deactivated" } }),
    );
    const { result, onAccountDeactivated } = await setup();

    let route: unknown = "unset";
    await act(async () => {
      route = await result.current.requestCode({
        phone: PHONE,
        method: "telegram",
      });
    });

    expect(route).toBeNull();
    expect(onAccountDeactivated).toHaveBeenCalledTimes(1);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it.each([
    ["telegram", "telegram_rate_limited"],
    ["telegram", "telegram_unavailable"],
    ["flashcall", "flashcall_rate_limited"],
  ] as const)("shows the configured text for %s %s", async (method, code) => {
    mockSendCode.mockReturnValue(rejected({ data: { code } }));
    const { result } = await setup();

    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method });
    });

    expect(mockToastError).toHaveBeenCalledWith(
      CODE_METHODS[method].errors[code],
    );
  });

  it("shows the server message for an unknown error", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { error: "Что-то пошло не так" } }),
    );
    const { result, onAccountDeactivated } = await setup();

    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method: "telegram" });
    });

    expect(mockToastError).toHaveBeenCalledWith("Что-то пошло не так");
    expect(onAccountDeactivated).not.toHaveBeenCalled();
  });

  it("clears the pending method after a failure", async () => {
    mockSendCode.mockReturnValue(rejected({ data: { error: "x" } }));
    const { result } = await setup();

    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method: "telegram" });
    });

    expect(result.current.pendingMethod).toBeNull();
  });

  it("tracks the failure reason and does not track a success", async () => {
    mockSendCode.mockReturnValueOnce(resolved(telegramResponse()));
    const { result } = await setup();
    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method: "telegram" });
    });
    expect(mockTrackAuthCodeFailed).not.toHaveBeenCalled();

    mockSendCode.mockReturnValueOnce(
      rejected({ data: { code: "telegram_unavailable" } }),
    );
    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method: "telegram" });
    });

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "telegram",
      "login",
      "telegram_unavailable",
    );
  });

  it("tracks an error without a code as unknown, with the reset flow", async () => {
    mockSendCode.mockReturnValue(rejected(new Error("offline")));
    const { result } = await setup({ flow: "reset" });

    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method: "flashcall" });
    });

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "flashcall",
      "reset",
      "unknown",
    );
  });

  it("tracks a deactivated account too", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { code: "account_deactivated" } }),
    );
    const { result } = await setup();

    await act(async () => {
      await result.current.requestCode({ phone: PHONE, method: "telegram" });
    });

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "telegram",
      "login",
      "account_deactivated",
    );
  });
});
