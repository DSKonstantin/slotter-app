import { useCallback, useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "expo-router";
import { usePreventRemove } from "@react-navigation/native";
import type { NavigationAction } from "@react-navigation/native";

type Options = {
  title?: string;
  message?: string;
  cancelText?: string;
  confirmText?: string;
  onConfirm?: () => void;
};

const DEFAULTS: Required<Omit<Options, "onConfirm">> = {
  title: "Отменить заполнение?",
  message: "Введённые данные будут потеряны",
  cancelText: "Остаться",
  confirmText: "Выйти",
};

export function useFormNavigationGuard(isDirty: boolean, options?: Options) {
  const navigation = useNavigation();
  const [isLeaving, setIsLeaving] = useState(false);
  const { title, message, cancelText, confirmText, onConfirm } = {
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
          onPress: () => {
            if (!onConfirm) {
              navigation.dispatch(data.action);
              return;
            }
            setIsLeaving(true);
            setTimeout(onConfirm, 0);
          },
        },
      ]);
    },
    [navigation, title, message, cancelText, confirmText, onConfirm],
  );

  usePreventRemove(isDirty && !isLeaving, onPreventRemove);
}
