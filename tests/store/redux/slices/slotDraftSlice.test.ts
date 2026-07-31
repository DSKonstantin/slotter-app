import reducer, {
  clearCreatedCustomer,
  clearSelectedCustomer,
  clearSlotDraft,
  setCreatedCustomer,
  setSelectedCustomer,
  setSlotDraft,
} from "@/src/store/redux/slices/slotDraftSlice";
import type {
  AdditionalService,
  Service,
} from "@/src/store/redux/services/api-types";

const initialState = {
  date: undefined,
  time: undefined,
  services: [],
  additionalServices: [],
  createdCustomer: undefined,
  selectedCustomer: undefined,
};

const service = { id: 1, name: "Стрижка" } as unknown as Service;
const additionalService = {
  id: 2,
  name: "Укладка",
} as unknown as AdditionalService;

describe("slotDraftSlice", () => {
  it("returns the initial state", () => {
    expect(reducer(undefined, { type: "@@INIT" })).toEqual(initialState);
  });

  it("setSlotDraft stores date/time/services together", () => {
    const next = reducer(
      initialState,
      setSlotDraft({
        date: "2026-07-22",
        time: "14:30",
        services: [service],
        additionalServices: [additionalService],
      }),
    );
    expect(next.date).toBe("2026-07-22");
    expect(next.time).toBe("14:30");
    expect(next.services).toEqual([service]);
    expect(next.additionalServices).toEqual([additionalService]);
  });

  it("clearSlotDraft resets the draft and both customer fields", () => {
    const filled = {
      date: "2026-07-22",
      time: "14:30",
      services: [service],
      additionalServices: [additionalService],
      createdCustomer: { id: 1, name: "Иван" },
      selectedCustomer: { id: 2, name: "Пётр" },
    };
    expect(reducer(filled, clearSlotDraft())).toEqual(initialState);
  });

  it("set/clear createdCustomer", () => {
    const withCustomer = reducer(
      initialState,
      setCreatedCustomer({ id: 1, name: "Иван" }),
    );
    expect(withCustomer.createdCustomer).toEqual({ id: 1, name: "Иван" });
    expect(
      reducer(withCustomer, clearCreatedCustomer()).createdCustomer,
    ).toBeUndefined();
  });

  it("set/clear selectedCustomer", () => {
    const withCustomer = reducer(
      initialState,
      setSelectedCustomer({ id: 2, name: "Пётр" }),
    );
    expect(withCustomer.selectedCustomer).toEqual({ id: 2, name: "Пётр" });
    expect(
      reducer(withCustomer, clearSelectedCustomer()).selectedCustomer,
    ).toBeUndefined();
  });
});
