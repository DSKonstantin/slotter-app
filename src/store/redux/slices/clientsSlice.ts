import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/src/store/redux/store";

type ClientsState = {
  search: string;
  tagId: number | undefined;
};

const initialState: ClientsState = {
  search: "",
  tagId: undefined,
};

const clientsSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setSearch(state, action: PayloadAction<string>) {
      state.search = action.payload;
    },

    setTagId(state, action: PayloadAction<number | undefined>) {
      state.tagId = action.payload;
    },

    resetClientsFilter(state) {
      state.search = "";
      state.tagId = undefined;
    },
  },
});

export const { setSearch, setTagId, resetClientsFilter } = clientsSlice.actions;

export const selectClientsSearch = (state: RootState) => state.clients.search;
export const selectClientsTagId = (state: RootState) => state.clients.tagId;

export default clientsSlice.reducer;
