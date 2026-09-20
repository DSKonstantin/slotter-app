import { act } from "react";
import { renderHook } from "@testing-library/react-native";
import { useCalendarRange } from "@/src/hooks/useCalendarRange";

const render = (initial?: { from: string; to: string } | null) =>
  renderHook(() => useCalendarRange(initial));

describe("useCalendarRange", () => {
  it("seeds from an initial range", async () => {
    const { result, unmount } = await render({
      from: "2026-09-10",
      to: "2026-09-12",
    });
    expect(result.current.start).toBe("2026-09-10");
    expect(result.current.end).toBe("2026-09-12");
    unmount();
  });

  it("treats a one-day initial range as start only", async () => {
    const { result, unmount } = await render({
      from: "2026-09-10",
      to: "2026-09-10",
    });
    expect(result.current.start).toBe("2026-09-10");
    expect(result.current.end).toBeNull();
    unmount();
  });

  it("first tap sets start, second sets end", async () => {
    const { result, unmount } = await render();
    act(() => result.current.onDayPress("2026-09-10"));
    expect(result.current.start).toBe("2026-09-10");
    expect(result.current.end).toBeNull();
    act(() => result.current.onDayPress("2026-09-15"));
    expect(result.current.start).toBe("2026-09-10");
    expect(result.current.end).toBe("2026-09-15");
    unmount();
  });

  it("orders endpoints when the second tap is before the first", async () => {
    const { result, unmount } = await render();
    act(() => result.current.onDayPress("2026-09-15"));
    act(() => result.current.onDayPress("2026-09-10"));
    expect(result.current.start).toBe("2026-09-10");
    expect(result.current.end).toBe("2026-09-15");
    unmount();
  });

  it("tapping the end clears only the end", async () => {
    const { result, unmount } = await render({
      from: "2026-09-10",
      to: "2026-09-15",
    });
    act(() => result.current.onDayPress("2026-09-15"));
    expect(result.current.start).toBe("2026-09-10");
    expect(result.current.end).toBeNull();
    unmount();
  });

  it("tapping the start clears the whole range", async () => {
    const { result, unmount } = await render({
      from: "2026-09-10",
      to: "2026-09-15",
    });
    act(() => result.current.onDayPress("2026-09-10"));
    expect(result.current.start).toBeNull();
    expect(result.current.end).toBeNull();
    unmount();
  });

  it("a tap after a complete range starts a new selection", async () => {
    const { result, unmount } = await render({
      from: "2026-09-10",
      to: "2026-09-15",
    });
    act(() => result.current.onDayPress("2026-09-20"));
    expect(result.current.start).toBe("2026-09-20");
    expect(result.current.end).toBeNull();
    unmount();
  });

  it("reset clears both endpoints", async () => {
    const { result, unmount } = await render({
      from: "2026-09-10",
      to: "2026-09-15",
    });
    act(() => result.current.reset());
    expect(result.current.start).toBeNull();
    expect(result.current.end).toBeNull();
    unmount();
  });
});
