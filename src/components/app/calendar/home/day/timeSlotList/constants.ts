import { colors } from "@/src/styles/colors";

export const HOUR_HEIGHT = 120;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const SLOT_GAP = 2;
export const H_PAD = 20;
export const LEFT_COL = 64;
export const RIGHT_GAP = 10;

export const LOADER_SPEED = 1.2;
export const BG = colors.neutral[100];
export const FG = "#F5F5FA";

export const SKELETON_ROWS: {
  label: string;
  card: { topOffset: number; height: number; widthRatio: number } | null;
}[] = [
  { label: "09:00", card: { topOffset: 12, height: 60, widthRatio: 0.72 } },
  { label: "10:00", card: { topOffset: 5, height: 88, widthRatio: 0.55 } },
  { label: "11:00", card: null },
  { label: "12:00", card: { topOffset: 18, height: 68, widthRatio: 0.65 } },
  { label: "13:00", card: null },
];
