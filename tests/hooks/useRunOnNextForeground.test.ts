import { AppState, type AppStateStatus } from "react-native";
import { renderHook, act } from "@testing-library/react-native";
import { useRunOnNextForeground } from "@/src/hooks/useRunOnNextForeground";

describe("useRunOnNextForeground", () => {
  let changeListener: (state: AppStateStatus) => void;
  let addEventListenerSpy: jest.SpyInstance;

  beforeEach(() => {
    AppState.currentState = "active";
    addEventListenerSpy = jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((event, listener) => {
        if (event === "change") changeListener = listener;
        return { remove: jest.fn() };
      });
  });

  afterEach(() => {
    addEventListenerSpy.mockRestore();
  });

  it("does not run anything until arm() is called", async () => {
    await renderHook(() => useRunOnNextForeground());
    const fn = jest.fn();

    await act(async () => {
      changeListener("background");
    });
    await act(async () => {
      changeListener("active");
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it("runs the armed function once on the next background/inactive -> active transition", async () => {
    const { result } = await renderHook(() => useRunOnNextForeground());
    const fn = jest.fn();

    await act(async () => {
      result.current(fn);
    });

    await act(async () => {
      changeListener("background");
    });
    await act(async () => {
      changeListener("active");
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("does not fire on transitions that don't end in 'active'", async () => {
    const { result } = await renderHook(() => useRunOnNextForeground());
    const fn = jest.fn();

    await act(async () => {
      result.current(fn);
    });

    await act(async () => {
      changeListener("background");
    });

    expect(fn).not.toHaveBeenCalled();
  });

  it("only fires once even if active fires again", async () => {
    const { result } = await renderHook(() => useRunOnNextForeground());
    const fn = jest.fn();

    await act(async () => {
      result.current(fn);
    });

    await act(async () => {
      changeListener("background");
    });
    await act(async () => {
      changeListener("active");
    });
    await act(async () => {
      changeListener("background");
    });
    await act(async () => {
      changeListener("active");
    });

    expect(fn).toHaveBeenCalledTimes(1);
  });
});
