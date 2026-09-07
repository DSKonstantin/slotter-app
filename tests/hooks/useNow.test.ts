import { AppState, type AppStateStatus } from "react-native";
import { renderHook, act } from "@testing-library/react-native";
import { useNow } from "@/src/hooks/useNow";

describe("useNow", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns a Date on first render", async () => {
    const { result } = await renderHook(() => useNow());
    expect(result.current).toBeInstanceOf(Date);
  });

  it("produces a fresh value after the interval elapses", async () => {
    const { result } = await renderHook(() => useNow(60_000));
    const first = result.current;

    await act(async () => {
      jest.advanceTimersByTime(60_000);
    });

    expect(result.current).not.toBe(first);
    expect(result.current.getTime()).toBeGreaterThanOrEqual(first.getTime());
  });

  it("does not tick before the interval elapses", async () => {
    const { result } = await renderHook(() => useNow(60_000));
    const first = result.current;

    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });

    expect(result.current).toBe(first);
  });

  // #18: в фоне RN замораживает setInterval — на возврате из фона время
  // должно догоняться сразу, не дожидаясь следующего тика интервала.
  describe("resync on return to foreground", () => {
    let changeListeners: Set<(state: AppStateStatus) => void>;
    let addEventListenerSpy: jest.SpyInstance;

    const emitAppState = (state: AppStateStatus) =>
      changeListeners.forEach((listener) => listener(state));

    beforeEach(() => {
      changeListeners = new Set();
      addEventListenerSpy = jest
        .spyOn(AppState, "addEventListener")
        .mockImplementation((event, listener) => {
          const fn = listener as (state: AppStateStatus) => void;
          if (event === "change") changeListeners.add(fn);
          return { remove: () => changeListeners.delete(fn) } as never;
        });
    });

    afterEach(() => {
      addEventListenerSpy.mockRestore();
    });

    it("jumps to the real current time on 'active' without waiting for the interval", async () => {
      jest.setSystemTime(new Date("2026-09-01T10:00:00Z"));
      const { result } = await renderHook(() => useNow(60_000));
      const first = result.current;

      // 5 минут прошло, пока приложение было в фоне и интервал не тикал
      // (двигаем только системные часы, не таймеры)
      jest.setSystemTime(new Date("2026-09-01T10:05:00Z"));

      await act(async () => {
        emitAppState("active");
      });

      expect(result.current).not.toBe(first);
      expect(result.current.getTime()).toBe(Date.parse("2026-09-01T10:05:00Z"));
    });

    it("does not tick on 'background' / 'inactive'", async () => {
      const { result } = await renderHook(() => useNow());
      const first = result.current;

      await act(async () => {
        emitAppState("background");
      });
      await act(async () => {
        emitAppState("inactive");
      });

      expect(result.current).toBe(first);
    });

    it("stops resyncing after unmount", async () => {
      const { result, unmount } = await renderHook(() => useNow());
      const first = result.current;

      await act(async () => {
        unmount();
      });
      jest.setSystemTime(new Date("2030-01-01T00:00:00Z"));
      await act(async () => {
        emitAppState("active");
      });

      expect(result.current).toBe(first);
    });
  });
});
