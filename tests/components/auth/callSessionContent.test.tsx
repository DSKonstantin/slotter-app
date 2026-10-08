import React from "react";
import { Linking } from "react-native";
import { act, fireEvent, render, screen } from "@testing-library/react-native";

import { CallSessionContent } from "@/src/components/auth/verify/CallSessionContent";

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
  jest.spyOn(Linking, "openURL").mockResolvedValue(true as never);
});

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

describe("CallSessionContent", () => {
  it("shows the number to call in the 8 800 format", async () => {
    await render(<CallSessionContent call_phone="78005553535" />);

    expect(screen.getByText("8 800 555 35 35")).toBeTruthy();
  });

  it("dials the number through the system", async () => {
    await render(<CallSessionContent call_phone="78005553535" />);

    await fireEvent.press(screen.getByText("Позвонить"));

    expect(Linking.openURL).toHaveBeenCalledWith("tel:+78005553535");
  });

  it("does not add a second plus to a number that already has one", async () => {
    await render(<CallSessionContent call_phone="+78005553535" />);

    await fireEvent.press(screen.getByText("Позвонить"));

    expect(Linking.openURL).toHaveBeenCalledWith("tel:+78005553535");
  });

  it("counts the session time down", async () => {
    await render(
      <CallSessionContent call_phone="78005553535" expiresIn={90} />,
    );

    expect(screen.getByText("1:30")).toBeTruthy();

    await tick(10_000);

    expect(screen.getByText("1:20")).toBeTruthy();
  });

  it("shows that it is waiting for the call", async () => {
    await render(<CallSessionContent call_phone="78005553535" />);

    expect(screen.getByText("Ожидаем звонок")).toBeTruthy();
  });
});

describe("CallSessionContent — refresh the number", () => {
  it("is not offered without a resend handler", async () => {
    await render(<CallSessionContent call_phone="78005553535" />);

    expect(screen.queryByText(/Обновить номер/)).toBeNull();
  });

  it("is blocked with a countdown at first", async () => {
    const onResend = jest.fn();
    await render(
      <CallSessionContent
        call_phone="78005553535"
        resendAfter={30}
        onResend={onResend}
      />,
    );

    expect(screen.getByText("Обновить номер · 0:30")).toBeTruthy();
    await fireEvent.press(screen.getByText("Обновить номер · 0:30"));
    expect(onResend).not.toHaveBeenCalled();
  });

  it("becomes available when the countdown is over", async () => {
    const onResend = jest.fn().mockResolvedValue(undefined);
    await render(
      <CallSessionContent
        call_phone="78005553535"
        resendAfter={5}
        onResend={onResend}
      />,
    );

    await tick(5_000);
    await fireEvent.press(screen.getByText("Обновить номер"));

    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it("shows loading and stays blocked while resending", async () => {
    const onResend = jest.fn();
    await render(
      <CallSessionContent
        call_phone="78005553535"
        resendAfter={1}
        onResend={onResend}
        isResending
      />,
    );
    await tick(1_000);

    const button = screen.getByText("Обновить номер").parent!;
    expect(button.props.accessibilityState).toEqual({
      disabled: true,
      busy: true,
    });
  });
});

describe("CallSessionContent — call me", () => {
  it("is offered only after the hint delay", async () => {
    const onSwitch = jest.fn();
    await render(
      <CallSessionContent
        call_phone="78005553535"
        onSwitchToFlashcall={onSwitch}
      />,
    );

    expect(screen.queryByText("Позвонить мне")).toBeNull();

    await tick(7_999);
    expect(screen.queryByText("Позвонить мне")).toBeNull();

    await tick(1);
    expect(screen.getByText("Позвонить мне")).toBeTruthy();
  });

  it("switches to flashcall when pressed", async () => {
    const onSwitch = jest.fn();
    await render(
      <CallSessionContent
        call_phone="78005553535"
        onSwitchToFlashcall={onSwitch}
      />,
    );
    await tick(8_000);

    await fireEvent.press(screen.getByText("Позвонить мне"));

    expect(onSwitch).toHaveBeenCalledTimes(1);
  });

  it("is never offered without a switch handler", async () => {
    await render(<CallSessionContent call_phone="78005553535" />);

    await tick(60_000);

    expect(screen.queryByText("Позвонить мне")).toBeNull();
  });

  it("shows loading while switching", async () => {
    await render(
      <CallSessionContent
        call_phone="78005553535"
        onSwitchToFlashcall={jest.fn()}
        isSwitchingToFlashcall
      />,
    );
    await tick(8_000);

    expect(
      screen.getByText("Позвонить мне").parent!.props.accessibilityState,
    ).toEqual({ disabled: true, busy: true });
  });
});
