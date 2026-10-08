import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { AccountDeactivatedModal } from "@/src/components/auth/verify/AccountDeactivatedModal";
import { SUPPORT_TELEGRAM_URL } from "@/src/constants/support";

const mockOpenBrowser = jest.fn();

jest.mock("expo-web-browser", () => ({
  openBrowserAsync: (url: string) => mockOpenBrowser(url),
}));

jest.mock("@/src/components/ui", () => {
  const { Pressable, Text, View } = require("react-native");
  return {
    Button: ({ title, onPress }: any) => (
      <Pressable onPress={onPress}>
        <Text>{title}</Text>
      </Pressable>
    ),
    StModal: ({ visible, children }: any) =>
      visible ? <View>{children}</View> : null,
    Typography: ({ children }: any) => <Text>{children}</Text>,
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AccountDeactivatedModal", () => {
  it("explains that the account is deactivated", async () => {
    await render(<AccountDeactivatedModal visible onClose={jest.fn()} />);

    expect(screen.getByText("Аккаунт деактивирован")).toBeTruthy();
    expect(screen.getByText(/обратитесь в поддержку/i)).toBeTruthy();
  });

  it("has no stray characters at the end of the explanation", async () => {
    await render(<AccountDeactivatedModal visible onClose={jest.fn()} />);

    const text = screen.getByText(/обратитесь в поддержку/i).props.children;
    expect(String(text).trim().endsWith("доступ.")).toBe(true);
  });

  it("opens the support chat", async () => {
    await render(<AccountDeactivatedModal visible onClose={jest.fn()} />);

    await fireEvent.press(screen.getByText("Написать в поддержку"));

    expect(mockOpenBrowser).toHaveBeenCalledWith(SUPPORT_TELEGRAM_URL);
  });

  it("closes", async () => {
    const onClose = jest.fn();
    await render(<AccountDeactivatedModal visible onClose={onClose} />);

    await fireEvent.press(screen.getByText("Закрыть"));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("renders nothing when hidden", async () => {
    await render(
      <AccountDeactivatedModal visible={false} onClose={jest.fn()} />,
    );

    expect(screen.queryByText("Аккаунт деактивирован")).toBeNull();
  });
});
