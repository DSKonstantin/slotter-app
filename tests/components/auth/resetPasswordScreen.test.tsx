import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import ResetPasswordPhone from "@/src/components/auth/resetPassword";

const mockPush = jest.fn();
const mockDispatch = jest.fn();
const mockOpenSheet = jest.fn();
const mockUseAuthMethodsFlow = jest.fn();
let mockIsPending = false;

jest.mock("expo-router", () => ({
  router: { push: (href: unknown) => mockPush(href) },
}));

jest.mock("@/src/store/redux/store", () => ({
  useAppDispatch: () => mockDispatch,
}));

jest.mock("@/src/store/redux/slices/authSlice", () => ({
  setToken: (token: string) => ({ type: "auth/setToken", payload: token }),
}));

jest.mock("@/src/components/ui", () => {
  const { Text } = require("react-native");
  return { Typography: ({ children }: any) => <Text>{children}</Text> };
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

jest.mock("@/src/components/auth/layout/footer", () => ({
  __esModule: true,
  default: ({ primary }: any) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable
        testID="primary"
        accessibilityState={{ disabled: !!primary.disabled }}
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

jest.mock("@/src/components/auth/AuthMethodsFlowSheet", () => ({
  AuthMethodsFlowSheet: () => {
    const { Text } = require("react-native");
    return <Text>flow-sheet</Text>;
  },
}));

jest.mock("@/src/components/auth/useAccountDeactivatedModal", () => ({
  useAccountDeactivatedModal: () => {
    const { Text } = require("react-native");
    return { show: jest.fn(), modal: <Text>deactivated-modal</Text> };
  },
}));

jest.mock("@/src/components/auth/useAuthMethodsFlow", () => ({
  useAuthMethodsFlow: (params: unknown) => {
    mockUseAuthMethodsFlow(params);
    return { openSheet: mockOpenSheet, isPending: mockIsPending };
  },
}));

const enterPhone = async (value: string) => {
  await fireEvent.changeText(screen.getByTestId("phone"), value);
};

const pressContinue = async () => {
  await act(async () => {
    fireEvent.press(screen.getByTestId("primary"));
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockIsPending = false;
});

describe("ResetPasswordPhone", () => {
  it("shows the title and the phone field", async () => {
    await render(<ResetPasswordPhone />);

    expect(screen.getByText("Сброс пароля")).toBeTruthy();
    expect(screen.getByTestId("phone")).toBeTruthy();
    expect(screen.getByText("flow-sheet")).toBeTruthy();
    expect(screen.getByText("deactivated-modal")).toBeTruthy();
  });

  it("opens the methods sheet for a valid phone", async () => {
    await render(<ResetPasswordPhone />);
    await enterPhone("+7 916 123-45-67");

    await pressContinue();

    expect(mockOpenSheet).toHaveBeenCalledTimes(1);
  });

  it.each(["", "+7 916 123", "+7 916 123-45-6"])(
    "does not open the sheet for the invalid phone %p",
    async (value) => {
      await render(<ResetPasswordPhone />);
      await enterPhone(value);

      await pressContinue();

      expect(mockOpenSheet).not.toHaveBeenCalled();
    },
  );

  it("starts the methods flow in the reset mode for the normalized phone", async () => {
    await render(<ResetPasswordPhone />);
    await enterPhone("+7 916 123-45-67");

    expect(mockUseAuthMethodsFlow).toHaveBeenLastCalledWith(
      expect.objectContaining({ flow: "reset", phone: "+79161234567" }),
    );
  });

  it("keeps the token and opens the new password screen after the call is confirmed", async () => {
    await render(<ResetPasswordPhone />);
    await enterPhone("+7 916 123-45-67");
    const { onCallbackAuthorized } =
      mockUseAuthMethodsFlow.mock.calls.at(-1)![0];

    await act(async () => onCallbackAuthorized("jwt"));

    expect(mockDispatch).toHaveBeenCalledWith({
      type: "auth/setToken",
      payload: "jwt",
    });
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/(password-reset)/new-password",
      params: { phone: "+79161234567" },
    });
  });

  it("blocks the button while a request is running", async () => {
    mockIsPending = true;
    await render(<ResetPasswordPhone />);
    await enterPhone("+7 916 123-45-67");

    await pressContinue();

    expect(mockOpenSheet).not.toHaveBeenCalled();
  });
});
