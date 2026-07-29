import { AppState, type AppStateStatus } from "react-native";
import { useNavigation } from "expo-router";
import { renderHook, act } from "@testing-library/react-native";
import { useRefetchOnForeground } from "@/src/hooks/useRefetchOnForeground";

jest.mock("expo-router", () => ({
  useNavigation: jest.fn(),
}));

const mockUseNavigation = useNavigation as jest.Mock;

describe("useRefetchOnForeground", () => {
  let changeListener: (state: AppStateStatus) => void;
  let addEventListenerSpy: jest.SpyInstance;
  let isFocused: jest.Mock;

  beforeEach(() => {
    AppState.currentState = "active";
    isFocused = jest.fn().mockReturnValue(true);
    mockUseNavigation.mockReturnValue({ isFocused });
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

  const goBackgroundThenActive = async () => {
    await act(async () => {
      changeListener("background");
    });
    await act(async () => {
      changeListener("active");
    });
  };

  it("refetches on a background -> active transition while the screen is focused", async () => {
    const refetch = jest.fn();
    await renderHook(() => useRefetchOnForeground(refetch));

    await goBackgroundThenActive();

    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("does not refetch when the screen isn't focused", async () => {
    isFocused.mockReturnValue(false);
    const refetch = jest.fn();
    await renderHook(() => useRefetchOnForeground(refetch));

    await goBackgroundThenActive();

    expect(refetch).not.toHaveBeenCalled();
  });

  it("does not refetch on transitions that don't end in 'active'", async () => {
    const refetch = jest.fn();
    await renderHook(() => useRefetchOnForeground(refetch));

    await act(async () => {
      changeListener("background");
    });

    expect(refetch).not.toHaveBeenCalled();
  });

  it("always calls the latest refetch function, even if it changed after mount", async () => {
    const firstRefetch = jest.fn();
    const secondRefetch = jest.fn();
    const { rerender } = await renderHook(
      ({ refetch }: { refetch: () => unknown }) =>
        useRefetchOnForeground(refetch),
      { initialProps: { refetch: firstRefetch } },
    );

    await rerender({ refetch: secondRefetch });
    await goBackgroundThenActive();

    expect(firstRefetch).not.toHaveBeenCalled();
    expect(secondRefetch).toHaveBeenCalledTimes(1);
  });
});
