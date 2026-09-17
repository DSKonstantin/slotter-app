import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatBreakAfter } from "@/src/utils/date/formatTime";
import BreakAfterModal from "@/src/components/shared/modals/BreakAfterModal";

const BreakAfterField = () => {
  const { control } = useFormContext();
  const {
    field: { value, onChange },
  } = useController({ name: "breakAfter", control });

  const [visible, setVisible] = useState(false);

  const current = typeof value === "number" ? value : 0;

  const handleSelect = (minutes: number) => {
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
          Добавится к новым записям с этой услугой
        </Typography>
      </Pressable>

      <BreakAfterModal
        visible={visible}
        currentMinutes={current}
        onClose={() => setVisible(false)}
        onSelect={handleSelect}
      />
    </>
  );
};

export default BreakAfterField;
