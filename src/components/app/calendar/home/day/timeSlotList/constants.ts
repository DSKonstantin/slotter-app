import { colors } from "@/src/styles/colors";

export const HOUR_HEIGHT = 80;
export const MINUTE_HEIGHT = HOUR_HEIGHT / 60;
export const SLOT_GAP = 2;
export const SHORT_SLOT_MIN_HEIGHT = 36;
export const LONG_SLOT_MIN_HEIGHT = 76;
export const LEFT_COL = 50;
export const RIGHT_GAP = 10;

export const LOADER_SPEED = 1.2;
export const BG = colors.neutral[100];
export const FG = "#F5F5FA";

export const SKELETON_ROW_COUNT = 5;

// The day's own start/end (e.g. 23:05) always gets a boundary mark now —
// when a regular hour/half-hour mark falls within this many minutes of it,
// drop that neighbor instead of stacking two labels/lines almost on top of
// each other.
export const MIN_BOUNDARY_MARK_GAP = 20;
