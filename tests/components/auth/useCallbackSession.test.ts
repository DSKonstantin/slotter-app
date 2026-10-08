import { act, renderHook } from "@testing-library/react-native";

import { useCallbackSession } from "@/src/components/auth/useCallbackSession";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockTrackAuthCodeFailed = jest.fn();
const mockTrackAuthSuccess = jest.fn();
const mockConfirmCode = jest.fn();
const mockSendCode = jest.fn();
const mockToastError = jest.fn();
const mockHandleAuthorized = jest.fn();

jest.mock("@/src/services/analytics", () => ({
  trackAuthCodeFailed: (...args: unknown[]) => mockTrackAuthCodeFailed(...args),
  trackAuthSuccess: (...args: unknown[]) => mockTrackAuthSuccess(...args),
}));

jest.mock("@/src/store/redux/services/api/authApi", () => ({
  useConfirmCodeMutation: () => [mockConfirmCode],
  useSendCodeMutation: () => [mockSendCode],
}));

jest.mock("@/src/components/ui/toast", () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

jest.mock("@/src/components/auth/useHandleAuthorized", () => ({
  useHandleAuthorized: () => mockHandleAuthorized,
}));

const PHONE = "+79161234567";
const SESSION = {
  call_phone: "78005553535",
  poll_interval: 3,
  resend_after: 60,
  expires_in: 600,
};
const AUTHORIZED = {
  status: "authorized",
  token: "jwt",
  resource: { id: 1 },
};

const setup = (params: Record<string, unknown> = {}) =>
  renderHook(() => useCallbackSession({ phone: PHONE, ...params } as never));

const startSession = async (
  hook: Awaited<ReturnType<typeof setup>>,
  session = SESSION,
) => {
  await act(async () => {
    hook.result.current.setCallSession(session);
  });
};

const tick = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useCallbackSession — polling", () => {
  it("does not poll without a session", async () => {
    await setup();

    await tick(60_000);

    expect(mockConfirmCode).not.toHaveBeenCalled();
  });

  it("polls confirm_code without a code every poll_interval", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup({ referralCode: "FRIEND" });
    await startSession(hook);

    await tick(2_999);
    expect(mockConfirmCode).not.toHaveBeenCalled();

    await tick(1);
    expect(mockConfirmCode).toHaveBeenCalledTimes(1);
    expect(mockConfirmCode).toHaveBeenCalledWith({
      phone: PHONE,
      type: "user",
      referral_code: "FRIEND",
    });

    await tick(3_000);
    expect(mockConfirmCode).toHaveBeenCalledTimes(2);
    expect(hook.result.current.callSession).toEqual(SESSION);
  });

  it("omits the referral code when there is none", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(mockConfirmCode.mock.calls[0][0]).not.toHaveProperty(
      "referral_code",
    );
  });

  it("finishes the session and logs in on authorized", async () => {
    mockConfirmCode.mockReturnValue(resolved(AUTHORIZED));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(hook.result.current.callSession).toBeNull();
    expect(mockHandleAuthorized).toHaveBeenCalledWith("jwt", { id: 1 });
  });

  it("hands the result to a custom authorized handler instead", async () => {
    mockConfirmCode.mockReturnValue(resolved(AUTHORIZED));
    const onAuthorized = jest.fn();
    const hook = await setup({ onAuthorized });
    await startSession(hook);

    await tick(3_000);

    expect(onAuthorized).toHaveBeenCalledWith("jwt", { id: 1 });
    expect(mockHandleAuthorized).not.toHaveBeenCalled();
  });

  it("ends the session with a message when the session expired", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "expired" }));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(hook.result.current.callSession).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith(
      "Сессия истекла. Попробуйте снова",
    );
  });

  it("ends the session with a message for a deactivated account", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "deactivated" }));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(hook.result.current.callSession).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith("Аккаунт деактивирован");
  });

  it("keeps polling after a failed request", async () => {
    mockConfirmCode.mockReturnValue(rejected({ data: { error: "x" } }));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);
    await tick(3_000);

    expect(mockConfirmCode).toHaveBeenCalledTimes(2);
    expect(hook.result.current.callSession).toEqual(SESSION);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("stops polling when the session is dropped", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup();
    await startSession(hook);

    await act(async () => {
      hook.result.current.setCallSession(null);
    });
    await tick(30_000);

    expect(mockConfirmCode).not.toHaveBeenCalled();
  });

  it("expires the session after expires_in seconds", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup();
    await startSession(hook, { ...SESSION, expires_in: 10 });

    await tick(9_999);
    expect(hook.result.current.callSession).not.toBeNull();

    await tick(1);

    expect(hook.result.current.callSession).toBeNull();
    expect(mockToastError).toHaveBeenCalledWith(
      "Сессия истекла. Попробуйте снова",
    );
  });
});

describe("useCallbackSession — resend", () => {
  it("requests a new callback number and updates the running session", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        method: "callback",
        call_phone: "78005550000",
        poll_interval: 3,
        resend_after: 30,
        expires_in: 500,
      }),
    );
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup();
    await startSession(hook);

    await act(async () => {
      await hook.result.current.handleResend();
    });

    expect(mockSendCode).toHaveBeenCalledWith({
      phone: PHONE,
      type: "user",
      method: "callback",
    });
    expect(hook.result.current.callSession).toEqual({
      call_phone: "78005550000",
      poll_interval: 3,
      resend_after: 30,
      expires_in: 500,
    });
  });

  it("does not open a session by itself", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        method: "callback",
        call_phone: "78005550000",
        poll_interval: 3,
        resend_after: 30,
        expires_in: 500,
      }),
    );
    const hook = await setup();

    await act(async () => {
      await hook.result.current.handleResend();
    });

    expect(hook.result.current.callSession).toBeNull();
  });

  it("keeps the session when the answer has no number", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        method: "callback",
        call_phone: null,
        resend_after: 30,
        expires_in: 500,
      }),
    );
    const hook = await setup();
    await startSession(hook);

    await act(async () => {
      await hook.result.current.handleResend();
    });

    expect(hook.result.current.callSession).toEqual(SESSION);
  });

  it("shows the server message when the resend fails", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { error: "Лимит звонков исчерпан" } }),
    );
    const hook = await setup();
    await startSession(hook);

    await act(async () => {
      await hook.result.current.handleResend();
    });

    expect(mockToastError).toHaveBeenCalledWith("Лимит звонков исчерпан");
    expect(hook.result.current.callSession).toEqual(SESSION);
  });
});

describe("useCallbackSession — tracking", () => {
  it("tracks a login by call for an existing account", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ ...AUTHORIZED, is_created: false }),
    );
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(mockTrackAuthSuccess).toHaveBeenCalledWith({
      method: "callback",
      flow: "login",
      isCreated: false,
    });
  });

  it("tracks a new account", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ ...AUTHORIZED, is_created: true }),
    );
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(mockTrackAuthSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ isCreated: true }),
    );
  });

  it("passes the reset flow to the success tracking", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ ...AUTHORIZED, is_created: false }),
    );
    const hook = await setup({ flow: "reset" });
    await startSession(hook);

    await tick(3_000);

    expect(mockTrackAuthSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ flow: "reset" }),
    );
  });

  it.each(["expired", "deactivated"])("tracks %s", async (status) => {
    mockConfirmCode.mockReturnValue(resolved({ status }));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "callback",
      "login",
      status,
    );
  });

  it("tracks the session running out as a timeout", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup();
    await startSession(hook, { ...SESSION, expires_in: 10 });

    await tick(10_000);

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "callback",
      "login",
      "timeout",
    );
  });

  it("does not track a still pending call", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "pending" }));
    const hook = await setup();
    await startSession(hook);

    await tick(3_000);

    expect(mockTrackAuthSuccess).not.toHaveBeenCalled();
    expect(mockTrackAuthCodeFailed).not.toHaveBeenCalled();
  });
});
