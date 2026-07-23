import { Alert } from "react-native";
import { useNavigation } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import { renderHook } from "@testing-library/react-native";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";

jest.mock("expo-router", () => ({
  useNavigation: jest.fn(),
}));
jest.mock("@react-navigation/native", () => ({
  usePreventRemove: jest.fn(),
}));

const mockUseNavigation = useNavigation as jest.Mock;
const mockUsePreventRemove = usePreventRemove as jest.Mock;

describe("useFormNavigationGuard", () => {
  let dispatch: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    dispatch = jest.fn();
    mockUseNavigation.mockReturnValue({ dispatch });
    jest.spyOn(Alert, "alert").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("forwards isDirty straight through to usePreventRemove", async () => {
    await renderHook(() => useFormNavigationGuard(true));
    expect(mockUsePreventRemove).toHaveBeenCalledWith(
      true,
      expect.any(Function),
    );

    await renderHook(() => useFormNavigationGuard(false));
    expect(mockUsePreventRemove).toHaveBeenCalledWith(
      false,
      expect.any(Function),
    );
  });

  it("shows the default confirmation copy when the guarded remove fires", async () => {
    await renderHook(() => useFormNavigationGuard(true));
    const onPreventRemove = mockUsePreventRemove.mock.calls[0][1];
    const action = { type: "GO_BACK" };

    onPreventRemove({ data: { action } });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Отменить заполнение?",
      "Введённые данные будут потеряны",
      [
        expect.objectContaining({ text: "Остаться", style: "cancel" }),
        expect.objectContaining({ text: "Выйти", style: "destructive" }),
      ],
    );
  });

  it("supports overriding the title/message/button labels", async () => {
    await renderHook(() =>
      useFormNavigationGuard(true, {
        title: "Уйти со страницы?",
        message: "Фото не сохранятся",
        cancelText: "Нет",
        confirmText: "Да",
      }),
    );
    const onPreventRemove = mockUsePreventRemove.mock.calls[0][1];

    onPreventRemove({ data: { action: { type: "GO_BACK" } } });

    expect(Alert.alert).toHaveBeenCalledWith(
      "Уйти со страницы?",
      "Фото не сохранятся",
      [
        expect.objectContaining({ text: "Нет" }),
        expect.objectContaining({ text: "Да" }),
      ],
    );
  });

  it("dispatches the original navigation action when the destructive option is confirmed", async () => {
    await renderHook(() => useFormNavigationGuard(true));
    const onPreventRemove = mockUsePreventRemove.mock.calls[0][1];
    const action = { type: "GO_BACK" };

    onPreventRemove({ data: { action } });
    const [, , buttons] = (Alert.alert as jest.Mock).mock.calls[0];
    const confirmButton = buttons.find(
      (b: { text: string }) => b.text === "Выйти",
    );

    confirmButton.onPress();

    expect(dispatch).toHaveBeenCalledWith(action);
  });
});
