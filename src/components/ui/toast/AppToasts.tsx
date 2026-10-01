import { Toasts, ToastPosition } from "@backpackapp-io/react-native-toast";
import { Easing } from "react-native-reanimated";

const ANIMATION_CONFIG = {
  duration: 420,
  easing: Easing.bezier(0.16, 1, 0.3, 1),
};

const EXTRA_INSETS = { top: -4 };

const DEFAULT_STYLE = { pressable: { left: 0, right: 0 } };

export const AppToasts = () => (
  <Toasts
    overrideDarkMode
    defaultPosition={ToastPosition.TOP}
    globalAnimationType="timing"
    globalAnimationConfig={ANIMATION_CONFIG}
    extraInsets={EXTRA_INSETS}
    defaultStyle={DEFAULT_STYLE}
  />
);
