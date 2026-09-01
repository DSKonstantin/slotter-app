import { renderHook, act } from "@testing-library/react-native";
import { useToday } from "@/src/hooks/useToday";

describe("useToday", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-08-31T23:59:00"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("returns the start of the current local day", async () => {
    const { result } = await renderHook(() => useToday());
    expect(result.current.getFullYear()).toBe(2026);
    expect(result.current.getMonth()).toBe(7); // August
    expect(result.current.getDate()).toBe(31);
    expect(result.current.getHours()).toBe(0);
  });

  it("keeps a stable reference within the same day", async () => {
    const { result, rerender } = await renderHook(() => useToday());
    const first = result.current;
    await act(async () => {
      jest.advanceTimersByTime(30_000);
    });
    rerender({});
    expect(result.current).toBe(first);
  });

  it("rolls over to the new day at midnight", async () => {
    const { result } = await renderHook(() => useToday());
    expect(result.current.getDate()).toBe(31);

    await act(async () => {
      jest.setSystemTime(new Date("2026-09-01T00:00:30"));
      jest.advanceTimersByTime(90_000);
    });

    expect(result.current.getMonth()).toBe(8); // September
    expect(result.current.getDate()).toBe(1);
  });
});
