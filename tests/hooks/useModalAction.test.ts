import { Platform } from "react-native";
import { renderHook, act } from "@testing-library/react-native";
import { useModalAction } from "@/src/hooks/useModalAction";

describe("useModalAction", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("scheduleAction closes the modal immediately without running the action yet", async () => {
    const close = jest.fn();
    const action = jest.fn();
    const { result } = await renderHook(() => useModalAction(close));

    await act(async () => {
      result.current.scheduleAction(action);
    });

    expect(close).toHaveBeenCalledTimes(1);
    expect(action).not.toHaveBeenCalled();
  });

  it("runs the scheduled action once onModalHide fires, after the platform dismiss delay", async () => {
    const close = jest.fn();
    const action = jest.fn();
    const { result } = await renderHook(() => useModalAction(close));

    await act(async () => {
      result.current.scheduleAction(action);
      result.current.onModalHide();
    });
    expect(action).not.toHaveBeenCalled();

    await act(async () => {
      jest.advanceTimersByTime(Platform.OS === "ios" ? 100 : 0);
    });
    expect(action).toHaveBeenCalledTimes(1);
  });

  it("onModalHide without a scheduled action is a no-op", async () => {
    const { result } = await renderHook(() => useModalAction(jest.fn()));

    await act(async () => {
      result.current.onModalHide();
    });
  });

  it("only the most recently scheduled action survives a second scheduleAction call", async () => {
    const close = jest.fn();
    const first = jest.fn();
    const second = jest.fn();
    const { result } = await renderHook(() => useModalAction(close));

    await act(async () => {
      result.current.scheduleAction(first);
      result.current.scheduleAction(second);
      result.current.onModalHide();
    });
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });
});
