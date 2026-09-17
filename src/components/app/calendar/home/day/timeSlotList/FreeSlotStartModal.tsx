import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import { toast } from "@backpackapp-io/react-native-toast";
import { buildMinuteOptions } from "@/src/utils/date/timeOptions";
import { formatMinutes } from "@/src/utils/date/formatTime";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { useCreateWorkingDayBreakMutation } from "@/src/store/redux/services/api/workingDaysApi";
import {
  StModal,
  Typography,
  Button,
  Input,
  StSvg,
  SegmentedControl,
} from "@/src/components/ui";
import { TimeWheel } from "@/src/components/ui/pickers/TimeWheel";
import { TimeWheelField } from "@/src/components/ui/fields/TimeWheelField";
import { colors } from "@/src/styles/colors";

export type FreeSlotRange = {
  start: number;
  end: number;
};

type Tab = "booking" | "block";

type FreeSlotStartModalProps = {
  visible: boolean;
  range: FreeSlotRange | null;
  workingDayId?: number;
  onClose: () => void;
  /** «Новая запись» tab — hands back the picked start minute for navigation. */
  onNext?: (start: number) => void;
};

const STEP_MINUTES = 15;
// The free gap itself can extend for hours (all the way to the next
// appointment or end of day), but scrolling through that whole window just
// to pick a start time near where the user tapped is impractical — cap the
// «Новая запись» picker to a 1-hour window from the tapped point.
const MAX_RANGE_MINUTES = 60;

const TABS: { label: string; value: Tab }[] = [
  { label: "Новая запись", value: "booking" },
  { label: "Занять время", value: "block" },
];

const clockAdornment = (
  <StSvg name="Time" size={24} color={colors.neutral[500]} />
);

const FreeSlotStartModal = ({
  visible,
  range,
  workingDayId,
  onClose,
  onNext,
}: FreeSlotStartModalProps) => {
  const [tab, setTab] = useState<Tab>("booking");
  // null = untouched → falls back to the first option. The modal is keyed per
  // range in the parent, so the reset effect below never runs on the initial
  // mount (wasVisible starts true) — can't rely on it to seed this.
  const [bookingStart, setBookingStart] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [blockStart, setBlockStart] = useState<number | null>(null);
  const [blockEnd, setBlockEnd] = useState<number | null>(null);
  // The «Новая запись» wheel is uncontrolled after mount — remount it (via
  // key) on a fresh open so it re-derives its scroll position from state.
  const [openKey, setOpenKey] = useState(0);

  const [createWorkingDayBreak, { isLoading: isBlocking }] =
    useCreateWorkingDayBreakMutation();

  // Shared by both tabs — the same 1-hour window from the tapped point.
  const bookingOptions = useMemo(() => {
    if (!range) return [];
    const end = Math.min(
      Math.max(range.start, range.end),
      range.start + MAX_RANGE_MINUTES,
    );
    return buildMinuteOptions({ start: range.start, end, step: STEP_MINUTES });
  }, [range]);

  // «Занять время» spans the whole free gap — up to the next appointment /
  // end of day, not just an hour out.
  const blockWindowOptions = useMemo(() => {
    if (!range) return [];
    return buildMinuteOptions({
      start: range.start,
      end: Math.max(range.start + STEP_MINUTES, range.end),
      step: STEP_MINUTES,
    });
  }, [range]);

  // Both wheels scroll the whole free gap; they just bound each other —
  // «Начало» stays before «Конец», «Конец» stays after «Начало». Until the
  // other end is picked, only the single unusable edge option is trimmed.
  const blockStartOptions = useMemo(
    () =>
      blockEnd == null
        ? blockWindowOptions.slice(0, -1)
        : blockWindowOptions.filter((o) => o < blockEnd),
    [blockWindowOptions, blockEnd],
  );

  const blockEndOptions = useMemo(
    () =>
      blockStart == null
        ? blockWindowOptions.slice(1)
        : blockWindowOptions.filter((o) => o > blockStart),
    [blockWindowOptions, blockStart],
  );

  // Reset everything on a genuine closed→open transition.
  const wasVisible = useRef(visible);
  useEffect(() => {
    const justOpened = visible && !wasVisible.current;
    wasVisible.current = visible;
    if (!justOpened) return;
    setTab("booking");
    setComment("");
    setBookingStart(null);
    setBlockStart(null);
    setBlockEnd(null);
    setOpenKey((key) => key + 1);
  }, [visible]);

  // Each field's option list already excludes anything that would cross the
  // other bound, so no clamping needed here.
  const handleBlockStartChange = useCallback((minutes: number) => {
    setBlockStart(minutes);
  }, []);

  const handleBlockEndChange = useCallback((minutes: number) => {
    setBlockEnd(minutes);
  }, []);

  const effectiveBookingStart = bookingStart ?? bookingOptions[0];

  const handleBookingConfirm = useCallback(() => {
    if (effectiveBookingStart == null) return;
    onNext?.(effectiveBookingStart);
    onClose();
  }, [effectiveBookingStart, onClose, onNext]);

  const handleBlockConfirm = useCallback(async () => {
    if (blockStart == null || blockEnd == null || !workingDayId) return;

    try {
      await createWorkingDayBreak({
        workingDayId,
        data: {
          start_at: formatMinutes(blockStart),
          end_at: formatMinutes(blockEnd),
          kind: "occupied",
          ...(comment && { name: comment }),
        },
      }).unwrap();
      toast.success("Время занято");
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось занять время"));
    }
  }, [
    blockEnd,
    blockStart,
    comment,
    createWorkingDayBreak,
    onClose,
    workingDayId,
  ]);

  const hasBookingOptions = bookingOptions.length > 0;
  // Need at least one start with an end after it (gap wider than one step).
  const canPickBlock = hasBookingOptions && blockWindowOptions.length > 1;
  const canBlock = blockStart != null && blockEnd != null;

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      // Swipe-to-dismiss is a vertical gesture on the same axis as the wheel's
      // own scroll — StModal wins the touch responder and the wheel never
      // scrolls. Disable it (same fix as TimeWheelPickerModal); the header
      // back arrow and backdrop press still close the modal.
      swipeDirection={undefined}
      // Only the «Занять время» tab has a text input — wrap it so the keyboard
      // pushes the field/CTA up instead of covering them. The «Новая запись»
      // tab stays unwrapped so the wheel's vertical drag isn't eaten by a
      // scroll view.
      keyboardAware={tab === "block"}
      headerLeft={{
        icon: <StSvg name="Arrow_left" size={24} color={colors.neutral[900]} />,
        onPress: onClose,
        accessibilityLabel: "Назад",
      }}
      header={
        <View className="mb-4">
          <Typography
            weight="semibold"
            className="text-display text-neutral-900 text-center mb-4"
          >
            Создать слот
          </Typography>
          <SegmentedControl
            options={TABS}
            value={tab}
            onChange={(value) => setTab(value as Tab)}
          />
        </View>
      }
    >
      {tab === "booking" ? (
        <View className="gap-2">
          <Typography className="text-caption text-neutral-500">
            Начало слота
          </Typography>
          {hasBookingOptions && (
            <TimeWheel
              key={`booking-${openKey}`}
              options={bookingOptions}
              value={effectiveBookingStart}
              onChange={setBookingStart}
            />
          )}
          <Button
            title="Продолжить"
            onPress={handleBookingConfirm}
            disabled={!hasBookingOptions}
            buttonClassName="mt-4"
          />
        </View>
      ) : (
        <View className="gap-4">
          <Input
            label="Комментарий"
            placeholder="Личное время"
            value={comment}
            onChangeText={setComment}
            hideErrorText
          />
          <View>
            <Typography className="mb-2 text-caption text-neutral-500">
              Длительность
            </Typography>
            {canPickBlock ? (
              <View className="flex-row items-start gap-2">
                <View className="flex-1">
                  <TimeWheelField
                    value={blockStart}
                    onChange={handleBlockStartChange}
                    options={blockStartOptions}
                    hideErrorText
                    endAdornment={clockAdornment}
                  />
                </View>
                <Typography className="mt-[13px] text-neutral-500">
                  —
                </Typography>
                <View className="flex-1">
                  <TimeWheelField
                    value={blockEnd}
                    onChange={handleBlockEndChange}
                    options={blockEndOptions}
                    hideErrorText
                    endAdornment={clockAdornment}
                  />
                </View>
              </View>
            ) : (
              <Typography className="text-body text-neutral-500">
                Недостаточно свободного времени
              </Typography>
            )}
          </View>
          <Button
            title="Занять время"
            onPress={handleBlockConfirm}
            disabled={!canBlock || isBlocking}
            loading={isBlocking}
            buttonClassName="mt-2"
          />
        </View>
      )}
    </StModal>
  );
};

export default memo(FreeSlotStartModal);
