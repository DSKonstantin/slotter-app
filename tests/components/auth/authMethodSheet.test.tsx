import React from "react";
import { Text } from "react-native";
import {
  fireEvent,
  render,
  screen,
  userEvent,
} from "@testing-library/react-native";

import { AuthMethodSheet } from "@/src/components/auth/verify/AuthMethodSheet";
import { CallMethod } from "@/src/components/auth/verify/CallMethod";
import { TelegramMethod } from "@/src/components/auth/verify/TelegramMethod";

const mockModalProps = jest.fn();
const CALL_BUTTON_LABEL = "Получить номер для звонка";

jest.mock("@/src/components/ui", () => {
  const { Pressable, Text: T, View } = require("react-native");
  return {
    Button: ({ title, onPress, disabled, loading, buttonProps }: any) => (
      <Pressable
        accessibilityRole="button"
        {...buttonProps}
        accessibilityState={{ disabled: !!disabled, busy: !!loading }}
        onPress={disabled ? undefined : onPress}
      >
        <T>{title}</T>
      </Pressable>
    ),
    Divider: () => null,
    StModal: (props: any) => {
      mockModalProps(props);
      return props.visible ? <View>{props.children}</View> : null;
    },
    StSvg: () => null,
    Typography: ({ children }: any) => <T>{children}</T>,
  };
});

jest.mock("@/src/components/auth/verify/CallMethodSkeleton", () => ({
  CallMethodSkeleton: () => {
    const { Text: T } = require("react-native");
    return <T>skeleton</T>;
  },
}));

jest.mock("@/src/components/auth/verify/CallSessionContent", () => ({
  CallSessionContent: ({ call_phone }: { call_phone: string }) => {
    const { Text: T } = require("react-native");
    return <T>{`call:${call_phone}`}</T>;
  },
}));

const lastModalProps = () =>
  mockModalProps.mock.calls[mockModalProps.mock.calls.length - 1][0];

beforeEach(() => {
  jest.clearAllMocks();
});

describe("AuthMethodSheet", () => {
  it("renders every child and separates them with Или", async () => {
    await render(
      <AuthMethodSheet visible onClose={jest.fn()}>
        <Text>first</Text>
        <Text>second</Text>
        <Text>third</Text>
      </AuthMethodSheet>,
    );

    expect(screen.getByText("first")).toBeTruthy();
    expect(screen.getByText("second")).toBeTruthy();
    expect(screen.getByText("third")).toBeTruthy();
    expect(screen.getAllByText("Или")).toHaveLength(2);
  });

  it("has no separator for a single child", async () => {
    await render(
      <AuthMethodSheet visible onClose={jest.fn()}>
        <Text>only</Text>
      </AuthMethodSheet>,
    );

    expect(screen.queryByText("Или")).toBeNull();
  });

  it("skips empty children without extra separators", async () => {
    await render(
      <AuthMethodSheet visible onClose={jest.fn()}>
        <Text>first</Text>
        {false}
        {null}
        <Text>second</Text>
      </AuthMethodSheet>,
    );

    expect(screen.getAllByText("Или")).toHaveLength(1);
  });

  it("is dismissible by default and has a close button", async () => {
    await render(
      <AuthMethodSheet visible onClose={jest.fn()}>
        <Text>method</Text>
      </AuthMethodSheet>,
    );

    expect(lastModalProps().dismissible).toBe(true);
    expect(lastModalProps().headerCloseButton).toBe(true);
  });

  it("forwards dismissible and the hidden callback to the modal", async () => {
    const onHidden = jest.fn();
    await render(
      <AuthMethodSheet
        visible
        onClose={jest.fn()}
        onHidden={onHidden}
        dismissible={false}
      >
        <Text>method</Text>
      </AuthMethodSheet>,
    );

    expect(lastModalProps().dismissible).toBe(false);
    expect(lastModalProps().onModalHide).toBe(onHidden);
  });
});

describe("CallMethod", () => {
  it("shows the call card and reports presses while idle", async () => {
    const onPress = jest.fn();
    await render(<CallMethod session={null} onPress={onPress} />);

    expect(screen.getByLabelText(CALL_BUTTON_LABEL)).toBeTruthy();
    await fireEvent.press(screen.getByLabelText(CALL_BUTTON_LABEL));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is blocked while another request is pending", async () => {
    const onPress = jest.fn();
    await render(<CallMethod session={null} onPress={onPress} disabled />);

    await userEvent.press(screen.getByLabelText(CALL_BUTTON_LABEL));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows a skeleton instead of the card while the number is requested", async () => {
    await render(<CallMethod session={null} onPress={jest.fn()} pending />);

    expect(screen.getByText("skeleton")).toBeTruthy();
    expect(screen.queryByLabelText(CALL_BUTTON_LABEL)).toBeNull();
  });

  it("does not show the skeleton when idle", async () => {
    await render(<CallMethod session={null} onPress={jest.fn()} />);

    expect(screen.queryByText("skeleton")).toBeNull();
  });

  it("prefers the call content over the skeleton", async () => {
    await render(
      <CallMethod
        session={{ call_phone: "88005553535" }}
        onPress={jest.fn()}
        pending
      />,
    );

    expect(screen.getByText("call:88005553535")).toBeTruthy();
    expect(screen.queryByText("skeleton")).toBeNull();
  });

  it("replaces the card with the call content once a session exists", async () => {
    await render(
      <CallMethod
        session={{ call_phone: "88005553535" }}
        onPress={jest.fn()}
      />,
    );

    expect(screen.getByText("call:88005553535")).toBeTruthy();
    expect(screen.queryByLabelText(CALL_BUTTON_LABEL)).toBeNull();
  });
});

describe("TelegramMethod", () => {
  it("reports presses", async () => {
    const onPress = jest.fn();
    await render(<TelegramMethod onPress={onPress} />);

    await fireEvent.press(screen.getByText("Получить код в Telegram"));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it("is blocked while another request is pending", async () => {
    const onPress = jest.fn();
    await render(<TelegramMethod onPress={onPress} disabled />);

    await userEvent.press(screen.getByText("Получить код в Telegram"));

    expect(onPress).not.toHaveBeenCalled();
  });

  it("shows loading on its own button", async () => {
    await render(<TelegramMethod onPress={jest.fn()} pending />);

    expect(
      screen.getByText("Получить код в Telegram").parent?.props
        .accessibilityState.busy,
    ).toBe(true);
  });
});

describe("call step in the sheet", () => {
  it("keeps Telegram under the call content", async () => {
    await render(
      <AuthMethodSheet visible onClose={jest.fn()} dismissible={false}>
        <CallMethod
          session={{ call_phone: "88005553535" }}
          onPress={jest.fn()}
        />
        <TelegramMethod onPress={jest.fn()} />
      </AuthMethodSheet>,
    );

    expect(screen.getByText("call:88005553535")).toBeTruthy();
    expect(screen.getByText("Получить код в Telegram")).toBeTruthy();
    expect(screen.getAllByText("Или")).toHaveLength(1);
    expect(lastModalProps().dismissible).toBe(false);
  });
});
