import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const NUM_COLUMNS = 2;
export const GAP = 2;
export const HORIZONTAL_PADDING = 20;
export const MAX_PHOTOS = 20;

export const ITEM_WIDTH =
  (SCREEN_WIDTH - HORIZONTAL_PADDING * 2 - GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

export const ITEM_HEIGHT = ITEM_WIDTH * (5 / 4);
