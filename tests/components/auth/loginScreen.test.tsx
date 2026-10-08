import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import Login from "@/src/components/auth/login";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockPush = jest.fn();
const mockLogin = jest.fn();
const mockHandleAuthorized = jest.fn();
const mockShowDeactivated = jest.fn();
const mockToastError = jest.fn();

jest.mock("expo-router", () => ({
  router: { push: (href: unknown) => mockPush(href) },
}));

jest.mock("@/src/components/ui/toast", () => ({
  toast: { error: (message: string) => mockToastError(message) },
}));

jest.mock("@/src/components/ui", () => {
  const { Text } = require("react-native");
  return { Typography: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock("@/src/components/shared/EyeToggle", () => ({
  __esModule: true,
  default: ({ onPress }: any) => {
    const { Pressable } = require("react-native");
    return <Pressable testID="eye" onPress={onPress} />;
  },
}));

jest.mock("@/src/store/redux/services/api/authApi", () => ({
  useLoginMutation: () => [mockLogin, { isLoading: false }],
}));

jest.mock("@/src/components/auth/useHandleAuthorized", () => ({
  useHandleAuthorized: () => mockHandleAuthorized,
}));

jest.mock("@/src/components/auth/useAccountDeactivatedModal", () => ({
  useAccountDeactivatedModal: () => {
    const { Text } = require("react-native");
    return { show: mockShowDeactivated, modal: <Text>deactivated-modal</Text> };
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
      <Pressable testID="primary" onPress={primary.onPress}>
        <Text>{primary.title}</Text>
      </Pressable>
    );
  },
}));

jest.mock("@/src/components/hookForm/rhf-text-field", () => ({
  RhfTextField: (props: any) => {
    const Field = require("@/tests/testUtils/rhfMocks").RhfTextFieldMock;
    return (
      <>
        <Field {...props} />
        {props.labelRight}
      </>
    );
  },
}));

const fill = async (identifier: string, password: string) => {
  await fireEvent.changeText(screen.getByTestId("identifier"), identifier);
  await fireEvent.changeText(screen.getByTestId("password"), password);
};

const submit = async () => {
  await act(async () => {
    fireEvent.press(screen.getByTestId("primary"));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe("Login", () => {
  it("logs in with an email and hands the result to the authorized handler", async () => {
    mockLogin.mockReturnValue(resolved({ token: "jwt", resource: { id: 1 } }));
    await render(<Login />);
    await fill("master@example.com", "secret1");

    await submit();

    expect(mockLogin).toHaveBeenCalledWith({
      email: "master@example.com",
      phone: undefined,
      password: "secret1",
      type: "user",
    });
    expect(mockHandleAuthorized).toHaveBeenCalledWith("jwt", { id: 1 });
  });

  it("logs in with a phone in the +7 format", async () => {
    mockLogin.mockReturnValue(resolved({ token: "jwt", resource: { id: 1 } }));
    await render(<Login />);
    await fill("+7 916 123-45-67", "secret1");

    await submit();

    expect(mockLogin).toHaveBeenCalledWith({
      email: undefined,
      phone: "+79161234567",
      password: "secret1",
      type: "user",
    });
  });

  it.each([
    ["", "secret1"],
    ["master@example.com", ""],
    ["not-an-email@", "secret1"],
    ["+7 916 123", "secret1"],
  ])("does not send an invalid form (%p, %p)", async (identifier, password) => {
    await render(<Login />);
    await fill(identifier, password);

    await submit();

    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("opens the deactivated modal for a deactivated account", async () => {
    mockLogin.mockReturnValue(
      rejected({ data: { code: "account_deactivated" } }),
    );
    await render(<Login />);
    await fill("master@example.com", "secret1");

    await submit();

    expect(mockShowDeactivated).toHaveBeenCalledTimes(1);
    expect(mockToastError).not.toHaveBeenCalled();
    expect(mockHandleAuthorized).not.toHaveBeenCalled();
  });

  it("shows the server message for a wrong password", async () => {
    mockLogin.mockReturnValue(
      rejected({ data: { error: "Неверный телефон/email или пароль" } }),
    );
    await render(<Login />);
    await fill("master@example.com", "wrong");

    await submit();

    expect(mockToastError).toHaveBeenCalledWith(
      "Неверный телефон/email или пароль",
    );
    expect(mockShowDeactivated).not.toHaveBeenCalled();
  });

  it("opens the password reset from the forgot password link", async () => {
    await render(<Login />);

    await fireEvent.press(screen.getByText("Забыли пароль?"));

    expect(mockPush).toHaveBeenCalledWith("/(password-reset)");
  });

  it("hides the password until the eye is pressed", async () => {
    await render(<Login />);

    expect(screen.getByTestId("password").props.secureTextEntry).toBe(true);

    await fireEvent.press(screen.getByTestId("eye"));
    expect(screen.getByTestId("password").props.secureTextEntry).toBe(false);

    await fireEvent.press(screen.getByTestId("eye"));
    expect(screen.getByTestId("password").props.secureTextEntry).toBe(true);
  });

  it("renders the deactivated modal slot", async () => {
    await render(<Login />);

    expect(screen.getByText("deactivated-modal")).toBeTruthy();
  });
});
