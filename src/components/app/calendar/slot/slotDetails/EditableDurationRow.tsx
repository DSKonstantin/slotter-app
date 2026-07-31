import React, { useState } from "react";
import { ActivityIndicator, Pressable } from "react-native";

import { StSvg } from "@/src/components/ui/StSvg";
import { Typography } from "@/src/components/ui/Typography";
import { TimeWheelPickerModal } from "@/src/components/ui/pickers/TimeWheelPickerModal";
import { colors } from "@/src/styles/colors";
import { FULL_DAY_MINUTE_OPTIONS } from "@/src/utils/date/timeOptions";
import InfoRow from "./InfoRow";

type Props = {
  label: string;
  displayValue: string;
  value: number;
  canEdit: boolean;
  isUpdating: boolean;
  onSave: (minutes: number) => void | Promise<void>;
  divider?: boolean;
};

const EditableDurationRow = ({
  label,
  displayValue,
  value,
  canEdit,
  isUpdating,
  onSave,
  divider = true,
}: Props) => {
  const [pickerOpen, setPickerOpen] = useState(false);

  const handleConfirm = (minutes: number) => {
    setPickerOpen(false);
    onSave(minutes);
  };

  return (
    <>
      <InfoRow
        label={label}
        divider={divider}
        right={
          <Pressable
            onPress={
              canEdit && !isUpdating ? () => setPickerOpen(true) : undefined
            }
            disabled={!canEdit || isUpdating}
            hitSlop={8}
            className="flex-row items-center gap-1 flex-1 justify-end active:opacity-70"
          >
            {isUpdating ? (
              <ActivityIndicator
                size="small"
                color={colors.primary.blue[500]}
              />
            ) : (
              <>
                <Typography
                  weight="regular"
                  className="text-body text-neutral-900 flex-shrink text-right"
                >
                  {displayValue}
                </Typography>
                {canEdit && (
                  <StSvg
                    name="Edit_light"
                    size={20}
                    color={colors.neutral[500]}
                  />
                )}
              </>
            )}
          </Pressable>
        }
      />

      <TimeWheelPickerModal
        visible={pickerOpen}
        options={FULL_DAY_MINUTE_OPTIONS}
        value={value}
        loop
        title="Выберите длительность"
        onConfirm={handleConfirm}
        onClose={() => setPickerOpen(false)}
      />
    </>
  );
};

export default EditableDurationRow;
