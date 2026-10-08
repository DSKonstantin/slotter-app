import React from "react";
import { fireEvent, render, screen } from "@testing-library/react-native";

import { AuthMethodsFlowSheet } from "@/src/components/auth/AuthMethodsFlowSheet";

jest.mock("@/src/components/auth/verify/AuthMethodSheet", () => ({
  AuthMethodSheet: ({ children, visible, dismissible }: any) => {
    const { Text, View } = require("react-native");
    return (
      <View>
        <Text>{`visible:${visible} dismissible:${dismissible}`}</Text>
        {children}
      </View>
    );
  },
}));

jest.mock("@/src/components/auth/verify/CallMethod", () => ({
  CallMethod: ({ onPress, disabled }: any) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable onPress={onPress}>
        <Text>{`call disabled:${disabled}`}</Text>
      </Pressable>
    );
  },
}));

jest.mock("@/src/components/auth/verify/TelegramMethod", () => ({
  TelegramMethod: ({ onPress, pending }: any) => {
    const { Pressable, Text } = require("react-native");
    return (
      <Pressable onPress={onPress}>
        <Text>{`telegram pending:${pending}`}</Text>
      </Pressable>
    );
  },
}));

const buildFlow = (overrides: Record<string, unknown> = {}) =>
  ({
    openSheet: jest.fn(),
    isPending: false,
    sheetProps: {
      visible: true,
      onClose: jest.fn(),
      onHidden: jest.fn(),
      dismissible: true,
    },
    callMethodProps: {
      session: null,
      pending: false,
      disabled: false,
      onPress: jest.fn(),
    },
    telegramMethodProps: {
      pending: false,
      disabled: false,
      onPress: jest.fn(),
    },
    ...overrides,
  }) as never;

describe("AuthMethodsFlowSheet", () => {
  it("renders the sheet with both methods and passes the sheet props", async () => {
    await render(<AuthMethodsFlowSheet flow={buildFlow()} />);

    expect(screen.getByText("visible:true dismissible:true")).toBeTruthy();
    expect(screen.getByText("call disabled:false")).toBeTruthy();
    expect(screen.getByText("telegram pending:false")).toBeTruthy();
  });

  it("wires each method to its own handler", async () => {
    const callPress = jest.fn();
    const telegramPress = jest.fn();
    await render(
      <AuthMethodsFlowSheet
        flow={buildFlow({
          callMethodProps: {
            session: null,
            pending: false,
            disabled: false,
            onPress: callPress,
          },
          telegramMethodProps: {
            pending: false,
            disabled: false,
            onPress: telegramPress,
          },
        })}
      />,
    );

    await fireEvent.press(screen.getByText("call disabled:false"));
    expect(callPress).toHaveBeenCalledTimes(1);
    expect(telegramPress).not.toHaveBeenCalled();

    await fireEvent.press(screen.getByText("telegram pending:false"));
    expect(telegramPress).toHaveBeenCalledTimes(1);
  });
});
