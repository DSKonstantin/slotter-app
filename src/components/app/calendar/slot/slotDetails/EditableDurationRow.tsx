import React, { useState } from "react";
import { ActivityIndicator, Platform, Pressable, View } from "react-native";
import RNDateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
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

const minutesToDate = (minutes: number): Date => {
  const d = new Date();
  d.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return d;
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
  const [tempDate, setTempDate] = useState<Date>(() => minutesToDate(value));

  const handleEdit = () => {
    setTempDate(minutesToDate(value));
    setPickerOpen(true);
  };

  const handleConfirm = () => {
    setPickerOpen(false);
    onSave(tempDate.getHours() * 60 + tempDate.getMinutes());
  };

  const handleChangeAndroid = (event: DateTimePickerEvent, selected?: Date) => {
    setPickerOpen(false);
    if (event.type === "set" && selected) {
      onSave(selected.getHours() * 60 + selected.getMinutes());
    }
  };

  return (
    <>
      <InfoRow
        label={label}
        divider={divider}
        right={
          <Pressable
            onPress={canEdit && !isUpdating ? handleEdit : undefined}
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

      {Platform.OS === "android" && pickerOpen && (
        <RNDateTimePicker
          value={tempDate}
          mode="time"
          is24Hour
          themeVariant="light"
          display="spinner"
          minuteInterval={5}
          onChange={handleChangeAndroid}
        />
      )}

      {Platform.OS === "ios" && (
        <StModal visible={pickerOpen} onClose={() => setPickerOpen(false)}>
          <Typography weight="semibold" className="text-display text-center">
            Выберите длительность
          </Typography>
          <View className="mt-6 items-center">
            <RNDateTimePicker
              value={tempDate}
              mode="time"
              is24Hour
              themeVariant="light"
              display="spinner"
              minuteInterval={5}
              onChange={(_, selected) => {
                if (selected) setTempDate(selected);
              }}
            />
          </View>
          <View className="mt-6 gap-3">
            <Button title="Готово" onPress={handleConfirm} />
            <Button
              title="Отмена"
              variant="secondary"
              onPress={() => setPickerOpen(false)}
            />
          </View>
        </StModal>
      )}
    </>
  );
};

export default EditableDurationRow;
