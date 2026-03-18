import { useSafeAreaInsets } from "react-native-safe-area-context";

export const useSafeAreaPadding = () => {
  const { left, right } = useSafeAreaInsets();

  return {
    sidePadding: {
      paddingLeft: left,
      paddingRight: right,
    },
    horizontalPadding: {
      paddingLeft: 20 + left,
      paddingRight: 20 + right,
    },
  };
};
