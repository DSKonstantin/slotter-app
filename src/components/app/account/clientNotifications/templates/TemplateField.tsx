import React from "react";
import {
  TextInput,
  View,
  type NativeSyntheticEvent,
  type TextInputSelectionChangeEventData,
} from "react-native";

import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { pluralize } from "@/src/utils/text/pluralize";

type Selection = { start: number; end: number };

type TemplateFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  selection: Selection;
  onSelectionChange: (selection: Selection) => void;
  maxLength: number;
  inputRef?: React.RefObject<TextInput | null>;
};

const TemplateField = ({
  value,
  onChangeText,
  selection,
  onSelectionChange,
  maxLength,
  inputRef,
}: TemplateFieldProps) => {
  const handleSelectionChange = (
    e: NativeSyntheticEvent<TextInputSelectionChangeEventData>,
  ) => {
    onSelectionChange(e.nativeEvent.selection);
  };

  return (
    <View>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        selection={selection}
        onSelectionChange={handleSelectionChange}
        multiline
        maxLength={maxLength}
        placeholder="Введите текст сообщения"
        placeholderTextColor={colors.neutral[400]}
        className="font-inter-regular text-body text-neutral-900 min-h-[96px]"
        style={{ textAlignVertical: "top" }}
      />
      <Typography className="text-caption text-neutral-400 text-right mt-1">
        {value.length}{" "}
        {pluralize(value.length, ["символ", "символа", "символов"])}
      </Typography>
    </View>
  );
};

export default TemplateField;
