import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SCREEN_PADDING } from "@/src/constants/layout";

export const useSafeAreaPadding = () => {
  const { left, right } = useSafeAreaInsets();

  return {
    sidePadding: {
      paddingLeft: left,
      paddingRight: right,
    },
    horizontalPadding: {
      paddingLeft: SCREEN_PADDING + left,
      paddingRight: SCREEN_PADDING + right,
    },
  };
};
