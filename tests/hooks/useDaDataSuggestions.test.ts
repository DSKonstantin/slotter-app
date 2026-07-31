import { renderHook } from "@testing-library/react-native";
import { useDaDataSuggestions } from "@/src/hooks/useDaDataSuggestions";

describe("useDaDataSuggestions (no API key configured)", () => {
  it("never fetches and returns empty, non-loading state regardless of query", async () => {
    const fetchMock = jest.fn();
    global.fetch = fetchMock as unknown as typeof fetch;

    const { result } = await renderHook(() => useDaDataSuggestions("Moscow"));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current).toEqual({ suggestions: [], isLoading: false });
  });
});
