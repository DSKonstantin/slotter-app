import reducer, {
  resetClientsFilter,
  setSearch,
  setTagId,
} from "@/src/store/redux/slices/clientsSlice";

const initialState = { search: "", tagId: undefined };

describe("clientsSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("setSearch stores the query", () => {
    expect(reducer(initialState, setSearch("Иван")).search).toBe("Иван");
  });

  it("setTagId stores or clears the selected tag", () => {
    expect(reducer(initialState, setTagId(5)).tagId).toBe(5);
    expect(
      reducer({ search: "x", tagId: 5 }, setTagId(undefined)).tagId,
    ).toBeUndefined();
  });

  it("resetClientsFilter clears both search and tagId", () => {
    const filtered = { search: "Иван", tagId: 5 };
    expect(reducer(filtered, resetClientsFilter())).toEqual(initialState);
  });
});
