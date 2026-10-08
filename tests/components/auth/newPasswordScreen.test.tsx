import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
} from "@testing-library/react-native";

import ResetPasswordNew from "@/src/components/auth/resetPassword/newPassword";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockResetPassword = jest.fn();
const mockHandleAuthorized = jest.fn();
const mockToastError = jest.fn();
let mockIsLoading = false;

jest.mock("expo-router", () => ({
  useLocalSearchParams: () => ({ phone: "+79161234567" }),
}));

jest.mock("@/src/components/ui/toast", () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

jest.mock("@/src/components/ui", () => {
  const { Text } = require("react-native");
  return { Typography: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock("@/src/store/redux/services/api/authApi", () => ({
  useResetPasswordMutation: () => [
    mockResetPassword,
    { isLoading: mockIsLoading },
  ],
}));

jest.mock("@/src/components/auth/useHandleAuthorized", () => ({
  useHandleAuthorized: () => mockHandleAuthorized,
}));

jest.mock("@/src/components/shared/EyeToggle", () => ({
  __esModule: true,
  default: ({ visible, onPress }: any) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable testID="eye" onPress={onPress}>
        <Text>{`eye:${visible}`}</Text>
      </Pressable>
    );
  },
}));

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

jest.mock("@/src/components/auth/layout/footer", () => ({
  __esModule: true,
  default: ({ primary }: any) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable
        testID="primary"
        accessibilityState={{
          disabled: !!primary.disabled,
          busy: !!primary.loading,
        }}
        onPress={primary.disabled ? undefined : primary.onPress}
      >
        <Text>{primary.title}</Text>
      </Pressable>
    );
  },
}));

jest.mock("@/src/components/hookForm/rhf-text-field", () => ({
  RhfTextField: (props: any) =>
    require("@/tests/testUtils/rhfMocks").RhfTextFieldMock(props),
}));

const STRONG = "Abcdef12";

const fill = async (password: string, confirmation = password) => {
  await fireEvent.changeText(screen.getByTestId("password"), password);
  await fireEvent.changeText(
    screen.getByTestId("password_confirmation"),
    confirmation,
  );
};

const submit = async () => {
  await act(async () => {
    fireEvent.press(screen.getByTestId("primary"));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsLoading = false;
});

describe("ResetPasswordNew — submit", () => {
  it("sets the new password for the phone from the previous step", async () => {
    mockResetPassword.mockReturnValue(
      resolved({ status: "authorized", token: "jwt", resource: { id: 1 } }),
    );
    await render(<ResetPasswordNew />);
    await fill(STRONG);

    await submit();

    expect(mockResetPassword).toHaveBeenCalledWith({
      type: "user",
      phone: "+79161234567",
      password: STRONG,
      password_confirmation: STRONG,
    });
  });

  it("logs in with the new token after the password was changed", async () => {
    mockResetPassword.mockReturnValue(
      resolved({ status: "authorized", token: "jwt", resource: { id: 1 } }),
    );
    await render(<ResetPasswordNew />);
    await fill(STRONG);

    await submit();

    expect(mockHandleAuthorized).toHaveBeenCalledWith("jwt", { id: 1 });
    expect(mockToastError).not.toHaveBeenCalled();
  });

  it("does not log in for any other status", async () => {
    mockResetPassword.mockReturnValue(resolved({ status: "pending" }));
    await render(<ResetPasswordNew />);
    await fill(STRONG);

    await submit();

    expect(mockHandleAuthorized).not.toHaveBeenCalled();
  });

  it("shows the server message when the request fails", async () => {
    mockResetPassword.mockReturnValue(
      rejected({ data: { error: "Пользователь не найден" } }),
    );
    await render(<ResetPasswordNew />);
    await fill(STRONG);

    await submit();

    expect(mockToastError).toHaveBeenCalledWith("Пользователь не найден");
    expect(mockHandleAuthorized).not.toHaveBeenCalled();
  });

  it("falls back to a generic message", async () => {
    mockResetPassword.mockReturnValue(rejected(new Error("offline")));
    await render(<ResetPasswordNew />);
    await fill(STRONG);

    await submit();

    expect(mockToastError).toHaveBeenCalledWith("Не удалось сбросить пароль");
  });
});

describe("ResetPasswordNew — validation", () => {
  it.each([
    ["too short", "Abc12"],
    ["no lowercase letters", "ABCDEF12"],
    ["no uppercase letters", "abcdef12"],
    ["no digits", "Abcdefgh"],
    ["a cyrillic letter", "Abcdef1я"],
    ["a space", "Abcdef 12"],
    ["empty", ""],
  ])("does not send a password with %s", async (_label, password) => {
    await render(<ResetPasswordNew />);
    await fill(password);

    await submit();

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("does not send when the confirmation differs", async () => {
    await render(<ResetPasswordNew />);
    await fill(STRONG, "Abcdef13");

    await submit();

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("does not send without a confirmation", async () => {
    await render(<ResetPasswordNew />);
    await fill(STRONG, "");

    await submit();

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it("accepts the allowed special characters", async () => {
    mockResetPassword.mockReturnValue(resolved({ status: "pending" }));
    await render(<ResetPasswordNew />);
    await fill("Abcdef1!@#");

    await submit();

    expect(mockResetPassword).toHaveBeenCalledTimes(1);
  });
});

describe("ResetPasswordNew — screen", () => {
  it("shows the title", async () => {
    await render(<ResetPasswordNew />);

    expect(screen.getByText("Новый пароль")).toBeTruthy();
    expect(screen.getByText("Сохранить пароль")).toBeTruthy();
  });

  it("hides both passwords at first", async () => {
    await render(<ResetPasswordNew />);

    expect(screen.getByTestId("password").props.secureTextEntry).toBe(true);
    expect(
      screen.getByTestId("password_confirmation").props.secureTextEntry,
    ).toBe(true);
  });

  it("reveals each password separately", async () => {
    await render(<ResetPasswordNew />);
    const [first, second] = screen.getAllByTestId("eye");

    await fireEvent.press(first);
    expect(screen.getByTestId("password").props.secureTextEntry).toBe(false);
    expect(
      screen.getByTestId("password_confirmation").props.secureTextEntry,
    ).toBe(true);

    await fireEvent.press(second);
    expect(
      screen.getByTestId("password_confirmation").props.secureTextEntry,
    ).toBe(false);

    await fireEvent.press(first);
    expect(screen.getByTestId("password").props.secureTextEntry).toBe(true);
  });

  it("blocks the button while the request runs", async () => {
    mockIsLoading = true;
    await render(<ResetPasswordNew />);
    await fill(STRONG);

    await userEvent.press(screen.getByTestId("primary"));

    expect(mockResetPassword).not.toHaveBeenCalled();
    expect(screen.getByTestId("primary").props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });
});
