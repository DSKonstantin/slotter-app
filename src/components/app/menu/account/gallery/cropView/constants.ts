import { Dimensions } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

export const CROP_SIDE_MARGIN = 24;
export const CROP_WIDTH = SCREEN_WIDTH - CROP_SIDE_MARGIN * 2;
export const CROP_HEIGHT = CROP_WIDTH * (5 / 4);

export type CropSize = {
  width: number;
  height: number;
};

export const CROP_SIZE: CropSize = {
  width: CROP_WIDTH,
  height: CROP_HEIGHT,
};
