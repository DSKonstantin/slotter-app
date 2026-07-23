import AsyncStorage from "@react-native-async-storage/async-storage";
import { renderHook, waitFor } from "@testing-library/react-native";
import { useScheduleTemplate } from "@/src/hooks/useScheduleTemplate";
import { ScheduleTemplateSchema } from "@/src/validation/schemas/scheduleTemplate.schema";

const STORAGE_KEY = "schedule_template";
const defaults = ScheduleTemplateSchema.getDefault();

describe("useScheduleTemplate", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
  });

  it("starts with schema defaults and flips isLoaded once storage has been read", async () => {
    const { result } = await renderHook(() => useScheduleTemplate());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.initialValues).toEqual(defaults);
  });

  it("loads previously saved values from storage", async () => {
    const saved = { ...defaults, startAt: "10:00", endAt: "19:00" };
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(saved));

    const { result } = await renderHook(() => useScheduleTemplate());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.initialValues).toEqual(saved);
  });

  it("falls back to defaults instead of throwing on corrupted stored JSON", async () => {
    await AsyncStorage.setItem(STORAGE_KEY, "{not valid json");

    const { result } = await renderHook(() => useScheduleTemplate());

    await waitFor(() => expect(result.current.isLoaded).toBe(true));
    expect(result.current.initialValues).toEqual(defaults);
  });

  it("save() persists the given values under the schedule_template key", async () => {
    const { result } = await renderHook(() => useScheduleTemplate());
    await waitFor(() => expect(result.current.isLoaded).toBe(true));

    const values = { ...defaults, startAt: "08:00", endAt: "17:00" };
    await result.current.save(values);

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    expect(JSON.parse(raw!)).toEqual(values);
  });
});
