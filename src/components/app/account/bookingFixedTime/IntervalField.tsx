import React, { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { BookingFixedTimeFormValues, DayId } from "./constants";
import { buildGrid } from "./utils";
import IntervalPickerModal from "./IntervalPickerModal";

const IntervalField = () => {
  const [visible, setVisible] = useState(false);

  const { control, getValues, setValue } =
    useFormContext<BookingFixedTimeFormValues>();
  const interval = useWatch({ control, name: "interval" });

  const handleConfirm = (next: number) => {
    const nextGrid = buildGrid(next);
    const keep = (times: number[] = []) =>
      times.filter((t) => nextGrid.includes(t));
    const dayTimes = getValues("dayTimes");
    const nextDayTimes = Object.fromEntries(
      (Object.keys(dayTimes) as DayId[]).map((day) => [
        day,
        keep(dayTimes[day]),
      ]),
    );

    setValue("interval", next, { shouldDirty: true });
    setValue("fixedTimes", keep(getValues("fixedTimes")), {
      shouldDirty: true,
    });
    setValue("dayTimes", nextDayTimes, { shouldDirty: true });
    setVisible(false);
  };

  return (
    <>
      <Card
        title="Интервал сетки"
        right={
          <>
            <Typography className="text-body text-neutral-500">
              {interval} мин
            </Typography>
            <StSvg name="Expand_right" size={20} color={colors.neutral[400]} />
          </>
        }
        onPress={() => setVisible(true)}
      />

      <IntervalPickerModal
        visible={visible}
        value={interval}
        onConfirm={handleConfirm}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

export default IntervalField;
