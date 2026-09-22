import React, { useMemo } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import ContentLoader, { Rect } from "react-content-loader/native";
import { SCREEN_PADDING } from "@/src/constants/layout";
import type { WorkingDayBreak } from "@/src/store/redux/services/api-types";
import { createSegments, getSegmentHeight } from "./segmentBuilder";
import {
  LEFT_COL,
  RIGHT_GAP,
  HOUR_HEIGHT,
  LOADER_SPEED,
  BG,
  FG,
  SKELETON_ROW_COUNT,
} from "./constants";

const EMPTY_BREAKS: WorkingDayBreak[] = [];

type Props = {
  bottomInset: number;
  startAt?: string;
  endAt?: string;
  breaks?: WorkingDayBreak[];
};

/** No real appointments exist yet — the segments here are shaped purely by
 * the day's working hours + breaks (both usually already cached from the
 * month-range query by the time this shows), so the skeleton's row heights
 * line up with what TimeSlotList renders once appointments arrive instead
 * of a generic fixed-row guess. Falls back to that generic grid only when
 * the working hours aren't known yet either (startAt/endAt missing). */
const TimeSlotListSkeleton = ({
  bottomInset,
  startAt,
  endAt,
  breaks = EMPTY_BREAKS,
}: Props) => {
  const { width } = useWindowDimensions();
  const contentWidth = width - SCREEN_PADDING * 2;
  const rightColWidth = contentWidth - LEFT_COL - RIGHT_GAP;

  const segments = useMemo(
    () => createSegments(startAt, endAt, breaks, [], []).segments,
    [startAt, endAt, breaks],
  );

  const rows = useMemo(() => {
    if (segments.length > 0) {
      let y = 0;
      return segments.map((segment) => {
        const height = getSegmentHeight(segment);
        const row = { y, height };
        y += height;
        return row;
      });
    }
    return Array.from({ length: SKELETON_ROW_COUNT }, (_, i) => ({
      y: i * HOUR_HEIGHT,
      height: HOUR_HEIGHT,
    }));
  }, [segments]);

  const totalHeight = rows.length
    ? rows[rows.length - 1].y + rows[rows.length - 1].height
    : HOUR_HEIGHT * SKELETON_ROW_COUNT;

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      className="flex-1 px-screen"
      contentContainerStyle={{ paddingBottom: bottomInset + 80 }}
      scrollEnabled={false}
    >
      <ContentLoader
        speed={LOADER_SPEED}
        width={contentWidth}
        height={totalHeight}
        backgroundColor={BG}
        foregroundColor={FG}
      >
        {rows.map((row, i) => (
          <React.Fragment key={i}>
            <Rect x={0} y={row.y + 2} rx={4} ry={4} width={32} height={12} />
            <Rect
              x={LEFT_COL + RIGHT_GAP}
              y={row.y + 1}
              rx={14}
              ry={14}
              width={rightColWidth}
              height={Math.max(row.height - 2, 0)}
            />
          </React.Fragment>
        ))}
      </ContentLoader>
    </ScrollView>
  );
};

export default TimeSlotListSkeleton;
