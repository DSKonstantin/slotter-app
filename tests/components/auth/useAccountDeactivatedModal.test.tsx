import React from "react";
import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from "@testing-library/react-native";

import { useAccountDeactivatedModal } from "@/src/components/auth/useAccountDeactivatedModal";

jest.mock("@/src/components/auth/verify/AccountDeactivatedModal", () => ({
  AccountDeactivatedModal: ({ visible, onClose }: any) => {
    const { Pressable, Text } = require("react-native");
    return visible ? (
      <Pressable onPress={onClose}>
        <Text>deactivated-modal</Text>
      </Pressable>
    ) : null;
  },
}));

describe("useAccountDeactivatedModal", () => {
  it("is hidden until shown", async () => {
    const { result } = await renderHook(() => useAccountDeactivatedModal());

    await render(<>{result.current.modal}</>);

    expect(screen.queryByText("deactivated-modal")).toBeNull();
  });

  it("shows the modal after show() and hides it on close", async () => {
    const { result } = await renderHook(() => useAccountDeactivatedModal());
    await act(async () => result.current.show());

    const view = await render(<>{result.current.modal}</>);
    expect(screen.getByText("deactivated-modal")).toBeTruthy();

    await fireEvent.press(screen.getByText("deactivated-modal"));
    await view.unmount();
    const { result: after } = await renderHook(() =>
      useAccountDeactivatedModal(),
    );
    expect(after.current.modal.props.visible).toBe(false);
  });

  it("keeps show() stable between renders", async () => {
    const { result, rerender } = await renderHook(() =>
      useAccountDeactivatedModal(),
    );
    const first = result.current.show;

    await rerender({});

    expect(result.current.show).toBe(first);
  });
});
