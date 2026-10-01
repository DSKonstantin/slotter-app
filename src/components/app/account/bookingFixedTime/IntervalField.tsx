import React, { useState } from "react";
import { Alert } from "react-native";
import { useController, useFormContext } from "react-hook-form";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { formatInterval } from "@/src/constants/bookingSteps";
import { formatMinutes } from "@/src/utils/date/formatTime";
import { colors } from "@/src/styles/colors";
import type { BookingFixedTimeFormValues } from "./constants";
import IntervalPickerModal from "./IntervalPickerModal";
import { collectOffGridTimes, dropOffGridTimes } from "./utils";

const MAX_LISTED_TIMES = 4;

const formatOffGridTimes = (times: number[]) => {
  const listed = times.slice(0, MAX_LISTED_TIMES).map(formatMinutes);
  const rest = times.length - listed.length;
  return rest > 0 ? `${listed.join(", ")} и ещё ${rest}` : listed.join(", ");
};

const IntervalField = () => {
  const [visible, setVisible] = useState(false);

  const { field } = useController<BookingFixedTimeFormValues, "interval">({
    name: "interval",
  });

  const { getValues, setValue } = useFormContext<BookingFixedTimeFormValues>();

  const applyInterval = (next: number) => {
    const lists = dropOffGridTimes(
      { fixedTimes: getValues("fixedTimes"), dayTimes: getValues("dayTimes") },
      next,
    );
    const options = { shouldDirty: true };
    setValue("fixedTimes", lists.fixedTimes, options);
    setValue("dayTimes", lists.dayTimes, options);
    field.onChange(next);
  };

  const handleConfirm = (next: number) => {
    setVisible(false);
    if (next === field.value) return;
    const offGrid = collectOffGridTimes(
      { fixedTimes: getValues("fixedTimes"), dayTimes: getValues("dayTimes") },
      next,
    );
    if (offGrid.length === 0) {
      field.onChange(next);
      return;
    }
    Alert.alert(
      "Изменить интервал?",
      `${formatOffGridTimes(offGrid)} не попадают в сетку ${formatInterval(next)} и будут сняты`,
      [
        { text: "Отмена", style: "cancel" },
        { text: "Изменить", onPress: () => applyInterval(next) },
      ],
    );
  };

  return (
    <>
      <Card
        title="Интервал сетки"
        right={
          <>
            <Typography className="text-body text-neutral-500">
              {formatInterval(field.value)}
            </Typography>
            <StSvg
              name="Expand_right_light"
              size={24}
              color={colors.neutral[400]}
            />
          </>
        }
        onPress={() => setVisible(true)}
      />

      <IntervalPickerModal
        visible={visible}
        value={field.value}
        onConfirm={handleConfirm}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

export default IntervalField;
