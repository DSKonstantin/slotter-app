import reducer, {
  resetEditMode,
  setEditModeType,
  toggleEditMode,
} from "@/src/store/redux/slices/servicesSlice";

const initialState = {
  isEditMode: false,
  editModeType: "categories" as const,
  isSearchMode: false,
};

describe("servicesSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("toggleEditMode entering edit mode also closes search mode", () => {
    const state = { ...initialState, isSearchMode: true };
    const next = reducer(state, toggleEditMode());
    expect(next.isEditMode).toBe(true);
    expect(next.isSearchMode).toBe(false);
  });

  it("toggleEditMode leaving edit mode resets editModeType but leaves search mode alone", () => {
    const state = {
      isEditMode: true,
      editModeType: "services" as const,
      isSearchMode: true,
    };
    const next = reducer(state, toggleEditMode());
    expect(next.isEditMode).toBe(false);
    expect(next.editModeType).toBe("categories");
    expect(next.isSearchMode).toBe(true);
  });

  it("setEditModeType updates only the mode type", () => {
    expect(
      reducer(initialState, setEditModeType("services")).editModeType,
    ).toBe("services");
  });

  it("resetEditMode returns edit mode and type to defaults", () => {
    const state = {
      isEditMode: true,
      editModeType: "services" as const,
      isSearchMode: true,
    };
    const next = reducer(state, resetEditMode());
    expect(next.isEditMode).toBe(false);
    expect(next.editModeType).toBe("categories");
    // resetEditMode intentionally doesn't touch isSearchMode
    expect(next.isSearchMode).toBe(true);
  });
});
