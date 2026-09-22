export {
  parseTime,
  formatMinutes as formatTime,
} from "@/src/utils/date/formatTime";

/** Vertical position (in px) of a time `t` within a [segStart, segEnd)
 * segment whose grid spans `gridHeight` px. */
export const markTop = (
  t: number,
  segStart: number,
  segEnd: number,
  gridHeight: number,
) => ((t - segStart) / (segEnd - segStart)) * gridHeight;
