import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { StSvg, Typography } from "@/src/components/ui";
import { TimeWheelPickerModal } from "@/src/components/ui/pickers/TimeWheelPickerModal";
import { colors } from "@/src/styles/colors";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";
import {
  BREAK_AFTER_MODAL_DESCRIPTION,
  formatBreakAfter,
} from "@/src/constants/serviceBreakAfter";

const BreakAfterField = () => {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name: "breakAfter", control });

  const [visible, setVisible] = useState(false);

  const current = typeof value === "number" ? value : 0;

  const handleConfirm = (minutes: number) => {
    onChange(minutes);
    setVisible(false);
  };

  return (
    <>
      <Pressable
        onPress={() => setVisible(true)}
        className="rounded-2xl bg-white p-4 border border-background active:opacity-70"
      >
        <View className="flex-row items-center gap-1.5">
          <Typography className="text-body flex-1">
            Перерыв после записи
          </Typography>
          <Typography className="text-body text-neutral-500">
            {formatBreakAfter(current)}
          </Typography>
          <StSvg
            name="Expand_right_light"
            size={24}
            color={colors.neutral[300]}
          />
        </View>
        <Typography
          weight="regular"
          className="text-caption text-neutral-500 mt-2"
        >
          Настраивается для каждой услуги отдельно и добавляется к длительности
          записи автоматически
        </Typography>
      </Pressable>

      <TimeWheelPickerModal
        visible={visible}
        options={FULL_DAY_MINUTE_OPTIONS}
        value={current}
        loop
        title="Перерыв после записи"
        description={BREAK_AFTER_MODAL_DESCRIPTION}
        onConfirm={handleConfirm}
        onClose={() => setVisible(false)}
      />
    </>
  );
};

export default BreakAfterField;
