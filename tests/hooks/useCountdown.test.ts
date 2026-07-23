import { renderHook, act } from "@testing-library/react-native";
import { useCountDown } from "@/src/hooks/useCountdown";

describe("useCountDown", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("does not start automatically unless autoStart is set", async () => {
    const { result } = await renderHook(() => useCountDown({ seconds: 10 }));
    expect(result.current.seconds).toBe(10);
    expect(result.current.isActive).toBe(false);
  });

  it("autoStart begins counting down immediately", async () => {
    const { result } = await renderHook(() =>
      useCountDown({ seconds: 5, autoStart: true }),
    );
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.seconds).toBe(3);
  });

  it("start() begins the countdown and pause() stops it without resetting", async () => {
    const { result } = await renderHook(() => useCountDown({ seconds: 5 }));

    await act(async () => {
      result.current.start();
    });
    expect(result.current.isActive).toBe(true);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.seconds).toBe(3);

    await act(async () => {
      result.current.pause();
    });
    expect(result.current.isActive).toBe(false);

    await act(async () => {
      jest.advanceTimersByTime(2000);
    });
    // paused — no further countdown
    expect(result.current.seconds).toBe(3);
  });

  it("stops itself at 0 instead of going negative", async () => {
    const { result } = await renderHook(() =>
      useCountDown({ seconds: 2, autoStart: true }),
    );

    await act(async () => {
      jest.advanceTimersByTime(5000);
    });
    expect(result.current.seconds).toBe(0);
    expect(result.current.isActive).toBe(false);
  });

  it("reset() stops and restores the initial seconds", async () => {
    const { result } = await renderHook(() =>
      useCountDown({ seconds: 5, autoStart: true }),
    );

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.seconds).toBe(2);

    await act(async () => {
      result.current.reset();
    });
    expect(result.current.seconds).toBe(5);
    expect(result.current.isActive).toBe(false);
  });
});
