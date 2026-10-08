import { act, renderHook } from "@testing-library/react-native";

import { useAuthMethodsFlow } from "@/src/components/auth/useAuthMethodsFlow";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockTrackAuthMethodPicked = jest.fn();
const mockPush = jest.fn();
const mockSetParams = jest.fn();
const mockToastError = jest.fn();
const mockSendCode = jest.fn();
const mockRequestCode = jest.fn();
const mockSetCallSession = jest.fn();
const mockHandleResend = jest.fn();
const mockUseRequestCode = jest.fn();
const mockUseCallbackSession = jest.fn();
let mockSearchParams: { openMethods?: string } = {};
let mockCallSession: unknown = null;
let mockPendingMethod: string | null = null;

jest.mock("@/src/services/analytics", () => ({
  trackAuthMethodPicked: (...args: unknown[]) =>
    mockTrackAuthMethodPicked(...args),
}));

jest.mock("expo-router", () => ({
  router: {
    push: (href: unknown) => mockPush(href),
    setParams: (params: unknown) => mockSetParams(params),
  },
  useLocalSearchParams: () => mockSearchParams,
}));

jest.mock("@/src/components/ui/toast", () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

jest.mock("@/src/store/redux/services/api/authApi", () => ({
  useSendCodeMutation: () => [mockSendCode],
}));

jest.mock("@/src/components/auth/useRequestCode", () => ({
  useRequestCode: (params: unknown) => {
    mockUseRequestCode(params);
    return { requestCode: mockRequestCode, pendingMethod: mockPendingMethod };
  },
}));

jest.mock("@/src/components/auth/useCallbackSession", () => ({
  useCallbackSession: (params: unknown) => {
    mockUseCallbackSession(params);
    return {
      callSession: mockCallSession,
      setCallSession: mockSetCallSession,
      handleResend: mockHandleResend,
    };
  },
}));

const PHONE = "+79161234567";
const CALL_RESPONSE = {
  method: "callback",
  call_phone: "78005553535",
  poll_interval: 3,
  resend_after: 60,
  expires_in: 600,
};

const setup = (overrides: Record<string, unknown> = {}) => {
  const onAccountDeactivated = jest.fn();
  const params = {
    phone: PHONE,
    referralCode: "FRIEND",
    onAccountDeactivated,
    ...overrides,
  };
  return renderHook(() => useAuthMethodsFlow(params as never)).then((hook) => ({
    ...hook,
    onAccountDeactivated,
  }));
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSearchParams = {};
  mockCallSession = null;
  mockPendingMethod = null;
});

describe("useAuthMethodsFlow — sheet", () => {
  it("starts closed and opens on demand", async () => {
    const { result } = await setup();
    expect(result.current.sheetProps.visible).toBe(false);

    await act(async () => result.current.openSheet());

    expect(result.current.sheetProps.visible).toBe(true);
  });

  it("closes and drops the call session on close", async () => {
    const { result } = await setup();
    await act(async () => result.current.openSheet());

    await act(async () => result.current.sheetProps.onClose());

    expect(result.current.sheetProps.visible).toBe(false);
    expect(mockSetCallSession).toHaveBeenCalledWith(null);
  });

  it("cannot be dismissed while a call session is running", async () => {
    mockCallSession = {
      call_phone: "78005553535",
      poll_interval: 3,
      resend_after: 60,
      expires_in: 600,
    };
    const { result } = await setup();

    expect(result.current.sheetProps.dismissible).toBe(false);
    expect(result.current.callMethodProps.session).toEqual(
      expect.objectContaining({
        call_phone: "78005553535",
        expiresIn: 600,
        resendAfter: 60,
      }),
    );
  });

  it("is dismissible without a call session", async () => {
    const { result } = await setup();

    expect(result.current.sheetProps.dismissible).toBe(true);
    expect(result.current.callMethodProps.session).toBeNull();
  });
});

describe("useAuthMethodsFlow — call", () => {
  it("opens a call session for the entered phone", async () => {
    mockSendCode.mockReturnValue(resolved(CALL_RESPONSE));
    const { result } = await setup();

    await act(async () => result.current.callMethodProps.onPress());

    expect(mockSendCode).toHaveBeenCalledWith({
      phone: PHONE,
      type: "user",
      method: "callback",
    });
    expect(mockSetCallSession).toHaveBeenCalledWith({
      call_phone: "78005553535",
      poll_interval: 3,
      resend_after: 60,
      expires_in: 600,
    });
    expect(result.current.isPending).toBe(false);
  });

  it("goes to the code screen when the server answers with another method", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        method: "flashcall",
        call_phone: null,
        code_length: 4,
        resend_after: 60,
        expires_in: 600,
      }),
    );
    const { result } = await setup();
    await act(async () => result.current.openSheet());

    await act(async () => result.current.callMethodProps.onPress());
    expect(mockPush).not.toHaveBeenCalled();
    expect(result.current.sheetProps.visible).toBe(false);

    await act(async () => result.current.sheetProps.onHidden());

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: "/(auth)/enter-code",
        params: expect.objectContaining({ method: "flashcall", flow: "login" }),
      }),
    );
  });

  it("opens the deactivated modal for a deactivated account", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { code: "account_deactivated" } }),
    );
    const { result, onAccountDeactivated } = await setup();

    await act(async () => result.current.callMethodProps.onPress());

    expect(onAccountDeactivated).toHaveBeenCalledTimes(1);
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it.each([
    ["spend_unavailable", "Звонки временно недоступны. Попробуйте позже"],
    ["gonec_unavailable", "Сервис временно недоступен. Попробуйте позже"],
  ])("shows a toast for %s", async (code, message) => {
    mockSendCode.mockReturnValue(rejected({ data: { code } }));
    const { result } = await setup();

    await act(async () => result.current.callMethodProps.onPress());

    expect(mockToastError).toHaveBeenCalledWith(message);
  });

  it("shows the server message for an unknown error", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { error: "Что-то пошло не так" } }),
    );
    const { result } = await setup();

    await act(async () => result.current.callMethodProps.onPress());

    expect(mockToastError).toHaveBeenCalledWith("Что-то пошло не так");
  });
});

describe("useAuthMethodsFlow — code methods", () => {
  it("requests telegram and opens the code screen only after the sheet is hidden", async () => {
    mockRequestCode.mockResolvedValue({ pathname: "/route", params: {} });
    const { result } = await setup();
    await act(async () => result.current.openSheet());

    await act(async () => result.current.telegramMethodProps.onPress());

    expect(mockRequestCode).toHaveBeenCalledWith({
      phone: PHONE,
      method: "telegram",
      referralCode: "FRIEND",
    });
    expect(mockSetCallSession).toHaveBeenCalledWith(null);
    expect(result.current.sheetProps.visible).toBe(false);
    expect(mockPush).not.toHaveBeenCalled();

    await act(async () => result.current.sheetProps.onHidden());

    expect(mockPush).toHaveBeenCalledWith({ pathname: "/route", params: {} });
  });

  it("keeps the sheet open when the request failed", async () => {
    mockRequestCode.mockResolvedValue(null);
    const { result } = await setup();
    await act(async () => result.current.openSheet());

    await act(async () => result.current.telegramMethodProps.onPress());
    await act(async () => result.current.sheetProps.onHidden());

    expect(result.current.sheetProps.visible).toBe(true);
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("pushes a pending route only once", async () => {
    mockRequestCode.mockResolvedValue({ pathname: "/route", params: {} });
    const { result } = await setup();
    await act(async () => result.current.telegramMethodProps.onPress());

    await act(async () => result.current.sheetProps.onHidden());
    await act(async () => result.current.sheetProps.onHidden());

    expect(mockPush).toHaveBeenCalledTimes(1);
  });

  it("switches a running call to flashcall", async () => {
    mockRequestCode.mockResolvedValue({ pathname: "/flash", params: {} });
    mockCallSession = {
      call_phone: "78005553535",
      poll_interval: 3,
      resend_after: 60,
      expires_in: 600,
    };
    const { result } = await setup();

    await act(async () =>
      result.current.callMethodProps.session!.onSwitchToFlashcall!(),
    );

    expect(mockRequestCode).toHaveBeenCalledWith(
      expect.objectContaining({ method: "flashcall" }),
    );
  });

  it("reports which method is pending and blocks the others", async () => {
    mockPendingMethod = "telegram";
    const { result } = await setup();

    expect(result.current.isPending).toBe(true);
    expect(result.current.telegramMethodProps.pending).toBe(true);
    expect(result.current.callMethodProps.pending).toBe(false);
    expect(result.current.callMethodProps.disabled).toBe(true);
  });
});

describe("useAuthMethodsFlow — flow", () => {
  it("passes the flow to the code request and defaults to login", async () => {
    await setup({ flow: "reset" });
    expect(mockUseRequestCode).toHaveBeenLastCalledWith(
      expect.objectContaining({ flow: "reset" }),
    );

    await setup();
    expect(mockUseRequestCode).toHaveBeenLastCalledWith(
      expect.objectContaining({ flow: "login" }),
    );
  });

  it("builds a reset route for a non-callback answer", async () => {
    mockSendCode.mockReturnValue(
      resolved({ method: "flashcall", resend_after: 60, expires_in: 600 }),
    );
    const { result } = await setup({ flow: "reset" });

    await act(async () => result.current.callMethodProps.onPress());
    await act(async () => result.current.sheetProps.onHidden());

    expect(mockPush).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/(password-reset)/enter-code" }),
    );
  });

  it("hands the authorized callback to the call session", async () => {
    const onCallbackAuthorized = jest.fn();
    await setup({ onCallbackAuthorized });

    expect(mockUseCallbackSession).toHaveBeenLastCalledWith(
      expect.objectContaining({
        phone: PHONE,
        referralCode: "FRIEND",
        onAuthorized: onCallbackAuthorized,
      }),
    );
  });
});

describe("useAuthMethodsFlow — returning from the code screen", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("opens the sheet once the transition is over and clears the param", async () => {
    mockSearchParams = { openMethods: "1" };
    const { result } = await setup();
    expect(result.current.sheetProps.visible).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(449);
    });
    expect(result.current.sheetProps.visible).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(1);
    });

    expect(result.current.sheetProps.visible).toBe(true);
    expect(mockSetParams).toHaveBeenCalledWith({ openMethods: undefined });
    expect(mockSendCode).not.toHaveBeenCalled();
  });

  it("also requests the call when asked to confirm by call", async () => {
    mockSearchParams = { openMethods: "call" };
    mockSendCode.mockReturnValue(resolved(CALL_RESPONSE));
    await setup();

    await act(async () => {
      jest.advanceTimersByTime(450);
    });

    expect(mockSendCode).toHaveBeenCalledWith({
      phone: PHONE,
      type: "user",
      method: "callback",
    });
  });

  it("does nothing without the param", async () => {
    const { result } = await setup();

    await act(async () => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.sheetProps.visible).toBe(false);
    expect(mockSetParams).not.toHaveBeenCalled();
  });
});

describe("useAuthMethodsFlow — tracking", () => {
  it("tracks picking a call with the callback method", async () => {
    mockSendCode.mockReturnValue(resolved(CALL_RESPONSE));
    const { result } = await setup();

    await act(async () => result.current.callMethodProps.onPress());

    expect(mockTrackAuthMethodPicked).toHaveBeenCalledWith("callback", "login");
  });

  it("tracks picking telegram", async () => {
    mockRequestCode.mockResolvedValue(null);
    const { result } = await setup();

    await act(async () => result.current.telegramMethodProps.onPress());

    expect(mockTrackAuthMethodPicked).toHaveBeenCalledWith("telegram", "login");
  });

  it("tracks the reset flow", async () => {
    mockRequestCode.mockResolvedValue(null);
    const { result } = await setup({ flow: "reset" });

    await act(async () => result.current.telegramMethodProps.onPress());

    expect(mockTrackAuthMethodPicked).toHaveBeenCalledWith("telegram", "reset");
  });

  it("tracks switching a running call to flashcall", async () => {
    mockRequestCode.mockResolvedValue(null);
    mockCallSession = {
      call_phone: "78005553535",
      poll_interval: 3,
      resend_after: 60,
      expires_in: 600,
    };
    const { result } = await setup();

    await act(async () =>
      result.current.callMethodProps.session!.onSwitchToFlashcall!(),
    );

    expect(mockTrackAuthMethodPicked).toHaveBeenCalledWith(
      "flashcall",
      "login",
    );
  });

  it("does not track just opening the sheet", async () => {
    const { result } = await setup();

    await act(async () => result.current.openSheet());

    expect(mockTrackAuthMethodPicked).not.toHaveBeenCalled();
  });
});
