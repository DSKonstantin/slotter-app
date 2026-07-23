import { renderHook, waitFor, act } from "@testing-library/react-native";

// ES `import`s are hoisted above plain statements by the transpiler, so
// setting process.env before a static `import` of the hook would still run
// too late — the hook reads EXPO_PUBLIC_DADATA_API_KEY once, at its own
// import time. A plain `require()` call is not hoisted, so setting the env
// var immediately before it here actually runs first.
process.env.EXPO_PUBLIC_DADATA_API_KEY = "test-key";
const { useDaDataSuggestions } =
  require("@/src/hooks/useDaDataSuggestions") as typeof import("@/src/hooks/useDaDataSuggestions");

describe("useDaDataSuggestions (API key configured)", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("does nothing for a blank/whitespace query", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = await renderHook(() => useDaDataSuggestions("   "));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ suggestions: [], isLoading: false });
  });

  it("fetches and maps suggestions when a query is present", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      json: () =>
        Promise.resolve({
          suggestions: [
            { value: "Moscow, Russia" },
            { value: "Moscow region" },
          ],
        }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = await renderHook(() => useDaDataSuggestions("Moscow"));

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("suggestions.dadata.ru"),
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({ Authorization: "Token test-key" }),
        body: JSON.stringify({ query: "Moscow", count: 10 }),
      }),
    );

    await waitFor(() =>
      expect(result.current.suggestions).toEqual([
        { id: "Moscow, Russia", title: "Moscow, Russia" },
        { id: "Moscow region", title: "Moscow region" },
      ]),
    );
    expect(result.current.isLoading).toBe(false);
  });

  it("clears suggestions and loading state when the request fails", async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error("network error"));

    const { result } = await renderHook(() => useDaDataSuggestions("Moscow"));

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.suggestions).toEqual([]);
  });

  it("resets to empty suggestions when the query is cleared back to blank", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      json: () => Promise.resolve({ suggestions: [{ value: "Moscow" }] }),
    });

    const { result, rerender } = await renderHook(
      ({ query }: { query: string }) => useDaDataSuggestions(query),
      { initialProps: { query: "Moscow" } },
    );
    await waitFor(() => expect(result.current.suggestions).toHaveLength(1));

    await act(async () => {
      rerender({ query: "" });
    });

    expect(result.current.suggestions).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });
});
