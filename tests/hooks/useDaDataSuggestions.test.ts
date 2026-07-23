import { renderHook } from "@testing-library/react-native";
import { useDaDataSuggestions } from "@/src/hooks/useDaDataSuggestions";

// EXPO_PUBLIC_DADATA_API_KEY is read from process.env once, at module import
// time, and is unset in this test environment by default — exercising the
// "API key configured" branch needs its own file (useDaDataSuggestions.withApiKey.test.ts)
// so the env var can be set before that file's first (and only) import of
// the hook; each Jest test file gets its own fresh module registry, so this
// needs no manual cache tricks.
describe("useDaDataSuggestions (no API key configured)", () => {
  it("never fetches and returns empty, non-loading state regardless of query", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = await renderHook(() => useDaDataSuggestions("Moscow"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ suggestions: [], isLoading: false });
  });
});
