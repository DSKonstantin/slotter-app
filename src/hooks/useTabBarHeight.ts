import { useWindowDimensions } from "react-native";
import {
  COMPACT_BREAKPOINT,
  TAB_BAR_HEIGHT,
  TAB_BAR_HEIGHT_LARGE,
} from "@/src/constants/tabs";

export const useTabBarHeight = () => {
  const { width } = useWindowDimensions();
  return width < COMPACT_BREAKPOINT ? TAB_BAR_HEIGHT : TAB_BAR_HEIGHT_LARGE;
};
