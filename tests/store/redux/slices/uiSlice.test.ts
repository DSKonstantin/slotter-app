import reducer, { setTabMenuOpen } from "@/src/store/redux/slices/uiSlice";

describe("uiSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual({
      isTabMenuOpen: false,
    });
  });

  it("setTabMenuOpen toggles the flag", () => {
    const state = { isTabMenuOpen: false };
    expect(reducer(state, setTabMenuOpen(true)).isTabMenuOpen).toBe(true);
    expect(
      reducer({ isTabMenuOpen: true }, setTabMenuOpen(false)).isTabMenuOpen,
    ).toBe(false);
  });
});
