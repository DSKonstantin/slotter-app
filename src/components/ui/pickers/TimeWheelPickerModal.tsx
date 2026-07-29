import React, { memo, useEffect, useRef, useState } from "react";
import { View, useWindowDimensions } from "react-native";
import { Button } from "@/src/components/ui/Button";
import { StModal } from "@/src/components/ui/StModal";
import { Typography } from "@/src/components/ui/Typography";
import { TimeWheel, PICKER_HEIGHT } from "./TimeWheel";

const TimeWheelSkeleton = memo(function TimeWheelSkeleton() {
  const { width: screenWidth } = useWindowDimensions();
  const pickerWidth = Math.min(320, screenWidth - 64);

  return (
    <View
      style={{ height: PICKER_HEIGHT, width: pickerWidth, alignSelf: "center" }}
      className="rounded-base bg-neutral-100 mb-4"
    />
  );
});

type TimeWheelPickerModalProps = {
  visible: boolean;
  options: number[];
  value?: number | null;
  defaultValue?: number;
  title: string;
  confirmLabel?: string;
  cancelLabel?: string | null;
  isLoading?: boolean;
  loop?: boolean;
  onConfirm: (minutes: number) => void;
  onClose: () => void;
};

const nearestOption = (value: number, options: number[]) =>
  options.reduce((nearest, opt) =>
    Math.abs(opt - value) < Math.abs(nearest - value) ? opt : nearest,
  );

const resolveInitial = (
  value: number | null | undefined,
  options: number[],
  defaultValue?: number,
) => {
  if (value !== undefined && value !== null) {
    if (options.includes(value)) return value;
    // Off-grid value (e.g. legacy data not aligned to the step) — snap to
    // the closest selectable option instead of silently jumping to 0.
    if (options.length > 0) return nearestOption(value, options);
  }
  if (defaultValue !== undefined && options.includes(defaultValue)) {
    return defaultValue;
  }
  return options[0] ?? 0;
};

export const TimeWheelPickerModal = ({
  visible,
  options,
  value,
  defaultValue,
  title,
  confirmLabel = "Готово",
  cancelLabel = "Отмена",
  isLoading = false,
  loop = false,
  onConfirm,
  onClose,
}: TimeWheelPickerModalProps) => {
  const [draft, setDraft] = useState(() =>
    resolveInitial(value, options, defaultValue),
  );
  // Bumped only on a genuine closed→open transition, so TimeWheel below
  // remounts and re-derives its wheel position from `draft` instead of
  // keeping whatever scroll position was left over from a previous open.
  // NOT bumped on the initial mount itself (wasVisible starts equal to
  // `visible`, so a component that mounts already-visible — e.g. keyed by
  // the caller per range — doesn't get an extra, unnecessary remount right
  // after mounting, which raced with the wheel library's own initial-scroll
  // setup). NOT keyed on `options`/`value` either, which can get a new
  // reference on unrelated parent re-renders (e.g. RTK Query refetches) and
  // would otherwise remount (and interrupt) the wheel mid-scroll. The
  // loading→loaded transition is already handled by the isLoading/skeleton
  // branch below mounting a fresh TimeWheel on its own.
  const wasVisible = useRef(visible);
  const [wheelKey, setWheelKey] = useState(0);

  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!justOpened) return;
    setDraft(resolveInitial(value, options, defaultValue));
    setWheelKey((key) => key + 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      // Swipe-to-dismiss is a vertical gesture, same axis as the wheel's own
      // scroll — StModal can't tell whose gesture it is (propagateSwipe has
      // no scroll-offset feedback without `scrollable`), so it wins the
      // touch responder and the wheel never gets to scroll. Must stay off.
      swipeDirection={undefined}
      header={
        <Typography
          weight="semibold"
          className="text-display text-neutral-900 mb-4 text-center"
        >
          {title}
        </Typography>
      }
      footer={
        !isLoading && (
          <View className="gap-3">
            <Button title={confirmLabel} onPress={() => onConfirm(draft)} />
            {cancelLabel !== null && (
              <Button
                title={cancelLabel}
                variant="secondary"
                onPress={onClose}
              />
            )}
          </View>
        )
      }
    >
      {isLoading ? (
        <TimeWheelSkeleton />
      ) : (
        options.length > 0 && (
          <TimeWheel
            key={wheelKey}
            options={options}
            value={draft}
            onChange={setDraft}
            loop={loop}
          />
        )
      )}
    </StModal>
  );
};
