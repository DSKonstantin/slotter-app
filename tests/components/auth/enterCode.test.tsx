import React from "react";
import { Linking } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import EnterCode from "@/src/components/auth/enterCode";
import { CODE_METHODS } from "@/src/components/auth/enterCode/codeMethods";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockTrackAuthCodeFailed = jest.fn();
const mockTrackAuthFallbackToCall = jest.fn();
const mockTrackAuthSuccess = jest.fn();
const mockParams: Record<string, string> = {};
const mockBack = jest.fn();
const mockDismissTo = jest.fn();
const mockPush = jest.fn();
const mockDispatch = jest.fn();
const mockToastError = jest.fn();
const mockHandleAuthorized = jest.fn();
const mockConfirmCode = jest.fn();
const mockSendCode = jest.fn();

jest.mock("@/src/services/analytics", () => ({
  trackAuthCodeFailed: (...args: unknown[]) => mockTrackAuthCodeFailed(...args),
  trackAuthFallbackToCall: (...args: unknown[]) =>
    mockTrackAuthFallbackToCall(...args),
  trackAuthSuccess: (...args: unknown[]) => mockTrackAuthSuccess(...args),
}));

jest.mock("expo-web-browser", () => ({ openBrowserAsync: jest.fn() }));

jest.mock("@/src/store/redux/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/src/store/redux/slices/authSlice", () => ({
  setToken: (token: string) => ({ type: "auth/setToken", payload: token }),
}));

jest.mock("expo-router", () => ({
  router: {
    back: () => mockBack(),
    dismissTo: (href: unknown) => mockDismissTo(href),
    push: (href: unknown) => mockPush(href),
  },
  useLocalSearchParams: () => mockParams,
}));

jest.mock("@/src/components/ui/toast", () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

jest.mock("@/src/components/ui", () => {
  const { Pressable: P, Text: T, View: V } = require("react-native");
  return {
    Button: ({ title, onPress, disabled }: any) => (
      <P accessibilityRole="button" onPress={disabled ? undefined : onPress}>
        <T>{title}</T>
      </P>
    ),
    Typography: ({ children, onPress }: any) => (
      <T onPress={onPress}>{children}</T>
    ),
    StSvg: () => null,
    StModal: ({ visible, children }: any) =>
      visible ? <V>{children}</V> : null,
  };
});

jest.mock("@/src/components/auth/layout", () => ({
  AuthScreenLayout: ({ header, footer, children }: any) => (
    <>
      {header}
      {children}
      {footer}
    </>
  ),
}));

jest.mock("@/src/components/auth/layout/header", () => () => null);

jest.mock("@/src/components/auth/enterCode/otpConfirm", () => ({
  OtpConfirm: ({
    length,
    onChange,
    onResend,
    resendLabel,
    resendSeconds,
  }: any) => {
    const { Pressable, Text, TextInput, View } = require("react-native");
    return (
      <View>
        <Text testID="otp-length">{String(length)}</Text>
        <Text testID="otp-seconds">{String(resendSeconds)}</Text>

        <TextInput testID="otp-input" onChangeText={onChange} />
        <Pressable testID="otp-resend" onPress={onResend}>
          <Text>{resendLabel ?? "Позвонить повторно"}</Text>
        </Pressable>
      </View>
    );
  },
}));

jest.mock("@/src/components/auth/useHandleAuthorized", () => ({
  useHandleAuthorized: () => mockHandleAuthorized,
}));

jest.mock("@/src/store/redux/services/api/authApi", () => ({
  useConfirmCodeMutation: () => [mockConfirmCode],
  useSendCodeMutation: () => [mockSendCode, { isLoading: false }],
}));

const setParams = (params: Record<string, string>) => {
  Object.keys(mockParams).forEach((key) => delete mockParams[key]);
  Object.assign(mockParams, params);
};

const telegramParams = (extra: Record<string, string> = {}) => ({
  phone: "+79161234567",
  method: "telegram",
  code_length: "6",
  resend_after: "30",
  bot_url: "https://t.me/slotter_robot",
  ...extra,
});

const flashcallParams = (extra: Record<string, string> = {}) => ({
  phone: "+79161234567",
  method: "flashcall",
  code_length: "4",
  resend_after: "60",
  ...extra,
});

const typeCode = async (code: string) => {
  await fireEvent.changeText(screen.getByTestId("otp-input"), code);
};

const pressNext = async () => {
  await fireEvent.press(screen.getByText("Далее"));
};

beforeEach(() => {
  jest.clearAllMocks();
  setParams({});
});

describe("EnterCode — texts", () => {
  it("shows telegram texts when the code is already in the chat", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    expect(screen.getByText("Введите код из Telegram")).toBeTruthy();
    expect(
      screen.getByText(CODE_METHODS.telegram.subtitle(6, "+7 916 123-45-67")),
    ).toBeTruthy();
    expect(screen.getByText(CODE_METHODS.telegram.link!.title)).toBeTruthy();
    expect(screen.getByText("Отправить заново")).toBeTruthy();
    expect(screen.getByTestId("otp-length").props.children).toBe("6");
  });

  it("shows the same subtitle whether or not the code is already in the chat", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    expect(
      screen.getByText(CODE_METHODS.telegram.subtitle(6, "+7 916 123-45-67")),
    ).toBeTruthy();
  });

  it("does not show the open button without bot_url", async () => {
    setParams(telegramParams({ bot_url: "" }));
    await render(<EnterCode />);

    expect(screen.queryByText(CODE_METHODS.telegram.link!.title)).toBeNull();
  });

  it("shows flashcall texts and no link button", async () => {
    setParams(flashcallParams());
    await render(<EnterCode />);

    expect(screen.getByText("Введите последние 4 цифры")).toBeTruthy();
    expect(screen.queryByText("Открыть бота в Telegram")).toBeNull();
    expect(screen.getByText("Позвонить повторно")).toBeTruthy();
  });

  it("falls back to flashcall for an unknown method and uses its code length", async () => {
    setParams({ phone: "+79161234567", method: "carrier-pigeon" });
    await render(<EnterCode />);

    expect(screen.getByText("Введите последние 4 цифры")).toBeTruthy();
    expect(screen.getByTestId("otp-length").props.children).toBe("4");
  });

  it("shows the formatted phone the code goes to", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    expect(screen.getByText("+7 916 123-45-67")).toBeTruthy();
  });

  it("puts the phone into the flashcall subtitle instead of a separate line", async () => {
    setParams(flashcallParams());
    await render(<EnterCode />);

    expect(
      screen.getByText(CODE_METHODS.flashcall.subtitle(4, "+7 916 123-45-67")),
    ).toBeTruthy();
    expect(screen.getAllByText("+7 916 123-45-67")).toHaveLength(1);
  });

  it("opens the bot link through the system", async () => {
    const openURL = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByText(CODE_METHODS.telegram.link!.title));

    expect(openURL).toHaveBeenCalledWith("https://t.me/slotter_robot");
  });

  it("shows a toast when the link cannot be opened", async () => {
    jest.spyOn(Linking, "openURL").mockRejectedValue(new Error("nope"));
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByText(CODE_METHODS.telegram.link!.title));

    expect(mockToastError).toHaveBeenCalledWith("Не удалось открыть Telegram");
  });
});

describe("EnterCode — values from the server", () => {
  it("waits for the resend delay the server gave", async () => {
    setParams(telegramParams({ resend_after: "45" }));
    await render(<EnterCode />);

    expect(screen.getByTestId("otp-seconds").props.children).toBe("45");
  });

  it("defaults the resend delay to a minute", async () => {
    setParams({ phone: "+79161234567", method: "telegram" });
    await render(<EnterCode />);

    expect(screen.getByTestId("otp-seconds").props.children).toBe("60");
  });

  it("takes the new delay from the answer to a resend", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        resend_after: 12,
        is_code_sent: true,
        bot_url: "https://t.me/b",
      }),
    );
    setParams(telegramParams({ resend_after: "30" }));
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(screen.getByTestId("otp-seconds").props.children).toBe("12");
  });

  it("uses the code length the server gave", async () => {
    setParams(telegramParams({ code_length: "8" }));
    await render(<EnterCode />);

    expect(screen.getByTestId("otp-length").props.children).toBe("8");
  });

  it("asks for the whole longer code before confirming", async () => {
    setParams(telegramParams({ code_length: "8" }));
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockConfirmCode).not.toHaveBeenCalled();
  });

  it("keeps the typed code after a trip to telegram", async () => {
    jest.spyOn(Linking, "openURL").mockResolvedValue(true as never);
    mockConfirmCode.mockReturnValue(
      resolved({ status: "wrong_code", attempts_left: 1 }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);
    await typeCode("123456");

    await fireEvent.press(screen.getByText(CODE_METHODS.telegram.link!.title));
    await pressNext();

    expect(mockConfirmCode).toHaveBeenCalledWith(
      expect.objectContaining({ code: "123456", method: "telegram" }),
    );
  });
});

describe("EnterCode — open telegram button", () => {
  const { title: BUTTON } = CODE_METHODS.telegram.link!;

  it("shows the button", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    expect(screen.getByText(BUTTON)).toBeTruthy();
  });

  it("is not shown without a bot link", async () => {
    setParams(telegramParams({ bot_url: "" }));
    await render(<EnterCode />);

    expect(screen.queryByText(BUTTON)).toBeNull();
  });

  it("is not shown for flashcall", async () => {
    setParams(flashcallParams());
    await render(<EnterCode />);

    expect(screen.queryByText(BUTTON)).toBeNull();
  });

  it("no longer opens a modal on top of the screen", async () => {
    jest.useFakeTimers();
    setParams(telegramParams());
    await render(<EnterCode />);

    await act(async () => {
      jest.advanceTimersByTime(5_000);
    });

    expect(screen.queryByText("Откройте бота в Telegram")).toBeNull();
    jest.useRealTimers();
  });

  it("keeps the screen as it was after a resend", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        resend_after: 30,
        is_code_sent: false,
        bot_url: "https://t.me/slotter_robot?start=login",
      }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(screen.getByText(BUTTON)).toBeTruthy();
  });

  it("opens the refreshed bot link after a resend", async () => {
    const openURL = jest
      .spyOn(Linking, "openURL")
      .mockResolvedValue(true as never);
    mockSendCode.mockReturnValue(
      resolved({
        resend_after: 30,
        is_code_sent: false,
        bot_url: "https://t.me/slotter_robot?start=login",
      }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);
    await fireEvent.press(screen.getByTestId("otp-resend"));

    await fireEvent.press(screen.getByText(BUTTON));

    expect(openURL).toHaveBeenCalledWith(
      "https://t.me/slotter_robot?start=login",
    );
  });
});

describe("EnterCode — reset flow", () => {
  const resetParams = (extra: Record<string, string> = {}) =>
    telegramParams({ flow: "reset", referralCode: "FRIEND", ...extra });

  it("keeps the token and opens the new password screen instead of logging in", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "authorized", token: "jwt", resource: { id: 1 } }),
    );
    setParams(resetParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "auth/setToken",
      payload: "jwt",
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(password-reset)/new-password",
      params: { phone: "+79161234567" },
    });
    expect(mockHandleAuthorized).not.toHaveBeenCalled();
  });

  it("does not send the referral code when resetting a password", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "wrong_code", attempts_left: 1 }),
    );
    setParams(resetParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockConfirmCode.mock.calls[0][0]).not.toHaveProperty(
      "referral_code",
    );
  });

  it("sends the user back to the reset screen to confirm by call", async () => {
    jest.useFakeTimers();
    setParams(resetParams());
    await render(<EnterCode />);
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    await fireEvent.press(screen.getByText("Подтвердить звонком"));

    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: "/(password-reset)",
      params: { openMethods: "call" },
    });
    jest.useRealTimers();
  });

  it("still logs in and sends the referral code in the login flow", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "authorized", token: "jwt", resource: { id: 1 } }),
    );
    setParams(telegramParams({ referralCode: "FRIEND" }));
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockConfirmCode.mock.calls[0][0]).toHaveProperty(
      "referral_code",
      "FRIEND",
    );
    expect(mockHandleAuthorized).toHaveBeenCalledWith("jwt", { id: 1 });
    expect(mockPush).not.toHaveBeenCalled();
  });
});

describe("EnterCode — confirm", () => {
  it("keeps the next button disabled until the whole code is entered", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("123");
    await pressNext();

    expect(mockConfirmCode).not.toHaveBeenCalled();
  });

  it("confirms a telegram code with method telegram", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "authorized", token: "jwt", resource: { id: 1 } }),
    );
    setParams(telegramParams({ referralCode: "FRIEND" }));
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockConfirmCode).toHaveBeenCalledWith({
      phone: "+79161234567",
      type: "user",
      code: "123456",
      method: "telegram",
      referral_code: "FRIEND",
    });
    expect(mockHandleAuthorized).toHaveBeenCalledWith("jwt", { id: 1 });
  });

  it("confirms a flashcall code without an explicit method", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "authorized", token: "jwt", resource: { id: 1 } }),
    );
    setParams(flashcallParams());
    await render(<EnterCode />);

    await typeCode("3867");
    await pressNext();

    const payload = mockConfirmCode.mock.calls[0][0];
    expect(payload).toEqual({
      phone: "+79161234567",
      type: "user",
      code: "3867",
    });
    expect(payload).not.toHaveProperty("method");
  });

  it("shows attempts left on a wrong code", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "wrong_code", attempts_left: 2 }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("111111");
    await pressNext();

    expect(screen.getByText("Неверный код. Осталось попыток: 2")).toBeTruthy();
    expect(mockHandleAuthorized).not.toHaveBeenCalled();
  });

  it("clears the wrong code message when the user edits the code", async () => {
    mockConfirmCode.mockReturnValue(
      resolved({ status: "wrong_code", attempts_left: 2 }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("111111");
    await pressNext();
    await typeCode("11111");

    expect(screen.queryByText(/Неверный код/)).toBeNull();
  });

  it("stays on the screen and offers a new code when the session expired", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "expired" }));
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(screen.getByText(CODE_METHODS.telegram.expiredText)).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("hides the expired message once the user starts typing again", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "expired" }));
    setParams(telegramParams());
    await render(<EnterCode />);
    await typeCode("123456");
    await pressNext();

    await typeCode("1");

    expect(screen.queryByText(CODE_METHODS.telegram.expiredText)).toBeNull();
  });

  it("hides the expired message after a successful resend", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "expired" }));
    mockSendCode.mockReturnValue(
      resolved({
        resend_after: 30,
        is_code_sent: true,
        bot_url: "https://t.me/b",
      }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);
    await typeCode("123456");
    await pressNext();

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(screen.queryByText(CODE_METHODS.telegram.expiredText)).toBeNull();
  });

  it("opens the deactivated modal when confirm says the account is deactivated", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "deactivated" }));
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(screen.getByText("Аккаунт деактивирован")).toBeTruthy();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it("opens the deactivated modal when resend says the account is deactivated", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { code: "account_deactivated" } }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(screen.getByText("Аккаунт деактивирован")).toBeTruthy();
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("closes the deactivated modal", async () => {
    mockConfirmCode.mockReturnValue(resolved({ status: "deactivated" }));
    setParams(telegramParams());
    await render(<EnterCode />);
    await typeCode("123456");
    await pressNext();

    await fireEvent.press(screen.getByText("Закрыть"));

    expect(screen.queryByText("Аккаунт деактивирован")).toBeNull();
  });

  it("shows a toast when the request fails", async () => {
    mockConfirmCode.mockReturnValue(
      rejected({ data: { error: "Сервер недоступен" } }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockToastError).toHaveBeenCalledWith("Сервер недоступен");
  });
});

describe("EnterCode — resend", () => {
  it("resends through telegram and refreshes the session state", async () => {
    mockSendCode.mockReturnValue(
      resolved({
        resend_after: 30,
        is_code_sent: false,
        bot_url: "https://t.me/slotter_robot?start=login",
      }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(mockSendCode).toHaveBeenCalledWith({
      phone: "+79161234567",
      type: "user",
      method: "telegram",
    });
    expect(
      screen.getByText(CODE_METHODS.telegram.subtitle(6, "+7 916 123-45-67")),
    ).toBeTruthy();
  });

  it("resends through flashcall for a flashcall session", async () => {
    mockSendCode.mockReturnValue(resolved({ resend_after: 60 }));
    setParams(flashcallParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(mockSendCode).toHaveBeenCalledWith({
      phone: "+79161234567",
      type: "user",
      method: "flashcall",
    });
  });

  it.each([
    [
      "telegram_rate_limited",
      "Лимит кодов исчерпан. Подтвердите номер звонком",
    ],
    ["telegram_unavailable", "Telegram недоступен. Подтвердите номер звонком"],
  ])("reveals the call fallback on %s", async (code, message) => {
    mockSendCode.mockReturnValue(rejected({ data: { code } }));
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(mockToastError).toHaveBeenCalledWith(message);
    expect(screen.getByText("Подтвердить звонком")).toBeTruthy();
    expect(
      screen.getByText("Не приходит код? Подтвердите номер звонком"),
    ).toBeTruthy();
  });

  it("shows the api message for an unknown resend error without the fallback", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { error: "Что-то пошло не так" } }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(mockToastError).toHaveBeenCalledWith("Что-то пошло не так");
    expect(screen.queryByText("Подтвердить звонком")).toBeNull();
  });
});

describe("EnterCode — call fallback", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("appears after 60 seconds for telegram, not before", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    await act(async () => {
      jest.advanceTimersByTime(59_999);
    });
    expect(screen.queryByText("Подтвердить звонком")).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByText("Подтвердить звонком")).toBeTruthy();
    expect(
      screen.getByText("Не приходит код? Подтвердите номер звонком"),
    ).toBeTruthy();
  });

  it("appears after 45 seconds for flashcall", async () => {
    setParams(flashcallParams());
    await render(<EnterCode />);

    await act(async () => {
      jest.advanceTimersByTime(44_999);
    });
    expect(screen.queryByText("Подтвердить звонком")).toBeNull();

    await act(async () => {
      jest.advanceTimersByTime(1);
    });
    expect(screen.getByText("Подтвердить звонком")).toBeTruthy();
    expect(
      screen.getByText("Звонок не пришёл? Подтвердите номер звонком"),
    ).toBeTruthy();
  });

  it("sends the user back to the phone screen to confirm by call", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    await fireEvent.press(screen.getByText("Подтвердить звонком"));

    expect(mockDismissTo).toHaveBeenCalledWith({
      pathname: "/(auth)/verify",
      params: { openMethods: "call" },
    });
    expect(mockSendCode).not.toHaveBeenCalled();
  });
});

describe("EnterCode — tracking", () => {
  const AUTHORIZED = (is_created: boolean) =>
    resolved({
      status: "authorized",
      token: "jwt",
      resource: { id: 1 },
      is_created,
    });

  it("tracks a telegram login for an existing account", async () => {
    mockConfirmCode.mockReturnValue(AUTHORIZED(false));
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockTrackAuthSuccess).toHaveBeenCalledWith({
      method: "telegram",
      flow: "login",
      isCreated: false,
    });
  });

  it("tracks a sign up for a new account", async () => {
    mockConfirmCode.mockReturnValue(AUTHORIZED(true));
    setParams(flashcallParams());
    await render(<EnterCode />);

    await typeCode("3867");
    await pressNext();

    expect(mockTrackAuthSuccess).toHaveBeenCalledWith({
      method: "flashcall",
      flow: "login",
      isCreated: true,
    });
  });

  it("passes the reset flow so that no login is reported", async () => {
    mockConfirmCode.mockReturnValue(AUTHORIZED(false));
    setParams(telegramParams({ flow: "reset" }));
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockTrackAuthSuccess).toHaveBeenCalledWith(
      expect.objectContaining({ flow: "reset" }),
    );
  });

  it.each([
    ["wrong_code", { status: "wrong_code", attempts_left: 2 }],
    ["expired", { status: "expired" }],
    ["deactivated", { status: "deactivated" }],
  ])("tracks the %s answer", async (reason, answer) => {
    mockConfirmCode.mockReturnValue(resolved(answer));
    setParams(telegramParams());
    await render(<EnterCode />);

    await typeCode("123456");
    await pressNext();

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "telegram",
      "login",
      reason,
    );
    expect(mockTrackAuthSuccess).not.toHaveBeenCalled();
  });

  it("tracks a failed resend with the server code", async () => {
    mockSendCode.mockReturnValue(
      rejected({ data: { code: "telegram_rate_limited" } }),
    );
    setParams(telegramParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "telegram",
      "login",
      "telegram_rate_limited",
    );
  });

  it("tracks a failed resend without a code as unknown", async () => {
    mockSendCode.mockReturnValue(rejected(new Error("offline")));
    setParams(flashcallParams());
    await render(<EnterCode />);

    await fireEvent.press(screen.getByTestId("otp-resend"));

    expect(mockTrackAuthCodeFailed).toHaveBeenCalledWith(
      "flashcall",
      "login",
      "unknown",
    );
  });

  it("tracks the fallback from telegram to a call", async () => {
    jest.useFakeTimers();
    setParams(telegramParams());
    await render(<EnterCode />);
    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    await fireEvent.press(screen.getByText("Подтвердить звонком"));

    expect(mockTrackAuthFallbackToCall).toHaveBeenCalledWith(
      "telegram",
      "login",
    );
    jest.useRealTimers();
  });

  it("does not track anything on a plain visit", async () => {
    setParams(telegramParams());
    await render(<EnterCode />);

    expect(mockTrackAuthSuccess).not.toHaveBeenCalled();
    expect(mockTrackAuthCodeFailed).not.toHaveBeenCalled();
    expect(mockTrackAuthFallbackToCall).not.toHaveBeenCalled();
  });
});
