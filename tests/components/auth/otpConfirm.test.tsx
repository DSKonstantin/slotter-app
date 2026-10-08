import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { OtpConfirm } from "@/src/components/auth/enterCode/otpConfirm";

jest.mock("@/src/components/ui", () => {
  const { Text } = require("react-native");
  return { Typography: ({ children }: any) => <Text>{children}</Text> };
});

jest.mock("@/src/components/auth/enterCode/ResendCodeButton", () => ({
  ResendCodeButton: ({ seconds, label, onResend }: any) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable testID="resend" onPress={onResend}>
        <Text>{`resend:${seconds}:${label ?? "default"}`}</Text>
      </Pressable>
    );
  },
}));

const getInput = () => screen.getByDisplayValue("");

describe("OtpConfirm", () => {
  it("reports every change of the entered code", async () => {
    const onChange = jest.fn();
    await render(
      <OtpConfirm length={6} onChange={onChange} onResend={jest.fn()} />,
    );

    await fireEvent.changeText(getInput(), "123");

    expect(onChange).toHaveBeenLastCalledWith("123");
  });

  it("reports the initial empty value", async () => {
    const onChange = jest.fn();
    await render(
      <OtpConfirm length={6} onChange={onChange} onResend={jest.fn()} />,
    );

    expect(onChange).toHaveBeenCalledWith("");
  });

  it("calls onComplete only when the whole code is entered", async () => {
    const onComplete = jest.fn();
    await render(
      <OtpConfirm
        length={4}
        onChange={jest.fn()}
        onComplete={onComplete}
        onResend={jest.fn()}
      />,
    );

    await fireEvent.changeText(getInput(), "123");
    expect(onComplete).not.toHaveBeenCalled();

    await fireEvent.changeText(screen.getByDisplayValue("123"), "1234");
    expect(onComplete).toHaveBeenCalledWith("1234");
  });

  it("passes the resend settings to the resend button", async () => {
    const onResend = jest.fn();
    await render(
      <OtpConfirm
        length={6}
        onChange={jest.fn()}
        onResend={onResend}
        resendSeconds={45}
        resendLabel="Отправить заново"
      />,
    );

    expect(screen.getByText("resend:45:Отправить заново")).toBeTruthy();
    await fireEvent.press(screen.getByTestId("resend"));
    expect(onResend).toHaveBeenCalledTimes(1);
  });

  it("falls back to a 60 second resend delay", async () => {
    await render(
      <OtpConfirm length={6} onChange={jest.fn()} onResend={jest.fn()} />,
    );

    expect(screen.getByText("resend:60:default")).toBeTruthy();
  });

  it("does not accept input while disabled", async () => {
    await render(
      <OtpConfirm
        length={6}
        onChange={jest.fn()}
        onResend={jest.fn()}
        disabled
      />,
    );

    expect(getInput().props.editable).toBe(false);
  });
});
