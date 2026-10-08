import React from "react";
import {
  act,
  fireEvent,
  render,
  screen,
  userEvent,
} from "@testing-library/react-native";

import Verify from "@/src/components/auth/verify";
import { rejected, resolved } from "@/tests/testUtils/rtk";

const mockOpenSheet = jest.fn();
const mockUseAuthMethodsFlow = jest.fn();
const mockValidateReferral = jest.fn();
const mockOpenBrowser = jest.fn();
let mockIspe = true;
let mockIsPending = false;

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: (url: string) => mockOpenBrowser(url),
}));

jest.mock("@/src/store/redux/store", () => ({
  useAppSelector: (selector: (state: unknown) => unknown) =>
    selector({ appVersion: { ispe: mockIspe } }),
}));

jest.mock("@/src/store/redux/services/api/referralApi", () => ({
  useLazyValidateReferralCodeQuery: () => [
    mockValidateReferral,
    { isFetching: false },
  ],
}));

jest.mock("@/src/components/ui", () => {
  const { Pressable, Text } = require("react-native");
  return {
    Button: ({ title, onPress, disabled }: any) => (
      <Pressable
        accessibilityState={{ disabled: !!disabled }}
        onPress={disabled ? undefined : onPress}
      >
        <Text>{title}</Text>
      </Pressable>
    ),
    Typography: ({ children, onPress }: any) => (
      <Text onPress={onPress}>{children}</Text>
    ),
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

jest.mock("@/src/components/hookForm/rhf-checkbox", () => ({
  __esModule: true,
  default: (props: any) =>
    require("@/tests/testUtils/rhfMocks").RhfCheckboxMock(props),
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

const PHONE = "+7 916 123-45-67";

const fillPhone = async (value = PHONE) => {
  await fireEvent.changeText(screen.getByTestId("phone"), value);
};

const acceptTerms = async () => {
  await fireEvent.press(screen.getByTestId("agreedToTerms"));
};

const pressContinue = async () => {
  await act(async () => {
    fireEvent.press(screen.getByTestId("primary"));
  });
};

const lastFlowParams = () => mockUseAuthMethodsFlow.mock.calls.at(-1)![0];

beforeEach(() => {
  jest.clearAllMocks();
  mockIspe = true;
  mockIsPending = false;
  process.env.EXPO_PUBLIC_BOOKING_BASE_URL = "https://book.example.com";
});

describe("Verify — continue", () => {
  it("opens the methods sheet for a valid phone with the terms accepted", async () => {
    await render(<Verify />);
    await fillPhone();
    await acceptTerms();

    await pressContinue();

    expect(mockOpenSheet).toHaveBeenCalledTimes(1);
  });

  it("does not open the sheet without accepting the terms", async () => {
    await render(<Verify />);
    await fillPhone();

    await pressContinue();

    expect(mockOpenSheet).not.toHaveBeenCalled();
    expect(screen.getByText("Необходимо принять условия")).toBeTruthy();
  });

  it("does not open the sheet for an invalid phone", async () => {
    await render(<Verify />);
    await fillPhone("+7 916 123");
    await acceptTerms();

    await pressContinue();

    expect(mockOpenSheet).not.toHaveBeenCalled();
  });

  it("does not require the marketing consent", async () => {
    await render(<Verify />);
    await fillPhone();
    await acceptTerms();

    await pressContinue();

    expect(mockOpenSheet).toHaveBeenCalled();
  });

  it("blocks the button while a request is running", async () => {
    mockIsPending = true;
    await render(<Verify />);
    await fillPhone();
    await acceptTerms();

    await pressContinue();

    expect(mockOpenSheet).not.toHaveBeenCalled();
  });
});

describe("Verify — methods flow", () => {
  it("starts the login flow for the normalized phone", async () => {
    await render(<Verify />);
    await fillPhone();

    expect(lastFlowParams()).toEqual(
      expect.objectContaining({ phone: "+79161234567" }),
    );
    expect(lastFlowParams().flow).toBeUndefined();
  });

  it("passes the trimmed promo code and drops an empty one", async () => {
    await render(<Verify />);
    expect(lastFlowParams().referralCode).toBeUndefined();

    await fireEvent.changeText(screen.getByTestId("promoCode"), "  FRIEND  ");

    expect(lastFlowParams().referralCode).toBe("FRIEND");
  });

  it("renders the methods sheet and the deactivated modal", async () => {
    await render(<Verify />);

    expect(screen.getByText("flow-sheet")).toBeTruthy();
    expect(screen.getByText("deactivated-modal")).toBeTruthy();
  });
});

describe("Verify — promo code", () => {
  it("is hidden when the paid edition is off", async () => {
    mockIspe = false;
    await render(<Verify />);

    expect(screen.queryByTestId("promoCode")).toBeNull();
    expect(screen.queryByText("Проверить")).toBeNull();
  });

  it("cannot be checked before four characters", async () => {
    await render(<Verify />);
    await fireEvent.changeText(screen.getByTestId("promoCode"), "ABC");

    await userEvent.press(screen.getByText("Проверить"));

    expect(mockValidateReferral).not.toHaveBeenCalled();
  });

  it("shows that a valid code is accepted", async () => {
    mockValidateReferral.mockReturnValue(resolved({ valid: true }));
    await render(<Verify />);
    await fireEvent.changeText(screen.getByTestId("promoCode"), "FRIEND");

    await fireEvent.press(screen.getByText("Проверить"));

    expect(mockValidateReferral).toHaveBeenCalledWith({ code: "FRIEND" });
    expect(await screen.findByText("Промокод действителен")).toBeTruthy();
  });

  it("shows the server reason for an invalid code", async () => {
    mockValidateReferral.mockReturnValue(
      resolved({ valid: false, error: "Код не найден" }),
    );
    await render(<Verify />);
    await fireEvent.changeText(screen.getByTestId("promoCode"), "WRONG1");

    await fireEvent.press(screen.getByText("Проверить"));

    expect(await screen.findByText("Код не найден")).toBeTruthy();
  });

  it("shows a message when the check itself fails", async () => {
    mockValidateReferral.mockReturnValue(rejected(new Error("offline")));
    await render(<Verify />);
    await fireEvent.changeText(screen.getByTestId("promoCode"), "FRIEND");

    await fireEvent.press(screen.getByText("Проверить"));

    expect(await screen.findByText("Не удалось проверить код")).toBeTruthy();
  });

  it("forgets the result when the code is edited", async () => {
    mockValidateReferral.mockReturnValue(resolved({ valid: true }));
    await render(<Verify />);
    await fireEvent.changeText(screen.getByTestId("promoCode"), "FRIEND");
    await fireEvent.press(screen.getByText("Проверить"));
    await screen.findByText("Промокод действителен");

    await fireEvent.changeText(screen.getByTestId("promoCode"), "FRIEN");

    expect(screen.queryByText("Промокод действителен")).toBeNull();
  });
});

describe("Verify — documents", () => {
  it("opens the user agreement", async () => {
    await render(<Verify />);

    await fireEvent.press(screen.getByText("условиями использования"));

    expect(mockOpenBrowser).toHaveBeenCalledWith(
      "https://book.example.com/user-agreement",
    );
  });

  it("opens the personal data policy from the consent", async () => {
    await render(<Verify />);

    await fireEvent.press(screen.getByText("обработку персональных данных"));

    expect(mockOpenBrowser).toHaveBeenCalledWith(
      "https://book.example.com/data-processing",
    );
  });
});
