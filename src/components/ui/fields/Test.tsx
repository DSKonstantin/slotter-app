import React, { useState } from "react";
import { Platform, View } from "react-native";
import RNDateTimePicker, {
  type DateTimePickerEvent,
} from "@react-native-community/datetimepicker";

import { StModal } from "@/src/components/ui/StModal";
import { Button, Typography } from "@/src/components/ui";

const Test = () => {
  const [open, setOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [tempTime, setTempTime] = useState(time);

  const formatTime = (d: Date) =>
    `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`;

  const onChangeAndroid = (_: DateTimePickerEvent, selected?: Date) => {
    // Android: picker закрывается сразу
    setOpen(false);

    if (selected) {
      setTime(selected);
    }
  };

  const onChangeIOS = (_: DateTimePickerEvent, selected?: Date) => {
    if (selected) setTempTime(selected);
  };

  return (
    <View className="p-5 gap-4">
      <Typography>Время: {formatTime(time)}</Typography>

      <Button
        title="Выбрать время"
        onPress={() => {
          if (Platform.OS === "ios") {
            setTempTime(time);
          }
          setOpen(true);
        }}
      />

      {Platform.OS === "android" && open && (
        <RNDateTimePicker
          value={time}
          mode="time"
          is24Hour
          display="spinner"
          onChange={onChangeAndroid}
        />
      )}

      {Platform.OS === "ios" && (
        <StModal visible={open} onClose={() => setOpen(false)}>
          <Typography weight="semibold" className="text-display text-center">
            Выберите время
          </Typography>

          <View className="mt-6">
            <RNDateTimePicker
              value={tempTime}
              mode="time"
              is24Hour
              display="spinner"
              onChange={onChangeIOS}
            />
          </View>

          <View className="mt-6 gap-3">
            <Button
              title="Готово"
              onPress={() => {
                setTime(tempTime);
                setOpen(false);
              }}
            />
            <Button
              title="Отмена"
              variant="secondary"
              onPress={() => setOpen(false)}
            />
          </View>
        </StModal>
      )}
    </View>
  );
};

export default Test;
