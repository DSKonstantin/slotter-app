import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { ResendCodeButton } from "@/src/components/auth/enterCode/ResendCodeButton";

jest.mock("@/src/components/ui", () => {
  const { Pressable, Text } = require("react-native");
  return {
    Button: ({ title, onPress, disabled, loading }: any) => (
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        onPress={disabled ? undefined : onPress}
      >
        <Text>{title}</Text>
      </Pressable>
    ),
    Typography: ({ children }: any) => <Text>{children}</Text>,
  };
});

const tick = async (ms: number) => {
  await act(async () => {
    jest.advanceTimersByTime(ms);
  });
};

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe("ResendCodeButton", () => {
  it("counts down before the button is available", async () => {
    await render(<ResendCodeButton seconds={30} onResend={jest.fn()} />);

    expect(screen.getByText("Повторить через 30с")).toBeTruthy();
    expect(screen.queryByText("Позвонить повторно")).toBeNull();

    await tick(10_000);

    expect(screen.getByText("Повторить через 20с")).toBeTruthy();
  });

  it("shows the button when the countdown is over", async () => {
    await render(<ResendCodeButton seconds={5} onResend={jest.fn()} />);

    await tick(5_000);

    expect(screen.getByText("Позвонить повторно")).toBeTruthy();
    expect(screen.queryByText(/Повторить через/)).toBeNull();
  });

  it("uses a custom label", async () => {
    await render(
      <ResendCodeButton
        seconds={1}
        label="Отправить заново"
        onResend={jest.fn()}
      />,
    );

    await tick(1_000);

    expect(screen.getByText("Отправить заново")).toBeTruthy();
  });

  it("is immediately available when there is nothing to wait for", async () => {
    await render(<ResendCodeButton seconds={0} onResend={jest.fn()} />);

    expect(screen.getByText("Позвонить повторно")).toBeTruthy();
  });

  it("resends and starts the countdown again", async () => {
    const onResend = jest.fn().mockResolvedValue(undefined);
    await render(<ResendCodeButton seconds={5} onResend={onResend} />);
    await tick(5_000);

    await fireEvent.press(screen.getByText("Позвонить повторно"));

    expect(onResend).toHaveBeenCalledTimes(1);
    expect(screen.getByText(/Повторить через/)).toBeTruthy();
  });

  it("does not resend while the countdown is running", async () => {
    const onResend = jest.fn();
    await render(<ResendCodeButton seconds={30} onResend={onResend} />);

    expect(screen.queryByText("Позвонить повторно")).toBeNull();
    expect(onResend).not.toHaveBeenCalled();
  });

  it("waits 30 seconds by default", async () => {
    await render(<ResendCodeButton onResend={jest.fn()} />);

    expect(screen.getByText("Повторить через 30с")).toBeTruthy();
  });
});
