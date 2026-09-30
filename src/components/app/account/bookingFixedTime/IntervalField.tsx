import React, { useState } from "react";
import { useController } from "react-hook-form";
import { Card, StSvg, Typography } from "@/src/components/ui";
import { formatInterval } from "@/src/constants/bookingSteps";
import { colors } from "@/src/styles/colors";
import type { BookingFixedTimeFormValues } from "./constants";
import IntervalPickerModal from "./IntervalPickerModal";

const IntervalField = () => {
  const [visible, setVisible] = useState(false);

  const { field } = useController<BookingFixedTimeFormValues, "interval">({
    name: "interval",
  });

  const handleConfirm = (next: number) => {
    field.onChange(next);
    setVisible(false);
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
