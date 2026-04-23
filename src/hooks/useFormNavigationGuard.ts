import { useCallback } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/native";

type Options = {
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
};

const DEFAULTS: Required<Options> = {
  title: "Отменить заполнение?",
  message: "Введённые данные будут потеряны",
  cancelText: "Остаться",
  confirmText: "Выйти",
};

export function useFormNavigationGuard(isDirty: boolean, options?: Options) {
  const navigation = useNavigation();
  const { title, message, cancelText, confirmText } = {
    ...DEFAULTS,
    ...options,
  };

  const onPreventRemove = useCallback(
    ({ data }: { data: { action: NavigationAction } }) => {
      Alert.alert(title, message, [
        { text: cancelText, style: "cancel" },
        {
          text: confirmText,
          style: "destructive",
          onPress: () => navigation.dispatch(data.action),
        },
      ]);
    },
    [navigation, title, message, cancelText, confirmText],
  );

  usePreventRemove(isDirty, onPreventRemove);
}
