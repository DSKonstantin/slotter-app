import React from "react";
import { ActivityIndicator, View } from "react-native";
import { Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";

interface Props {
  fieldName: string;
  isUpdating: boolean;
  onFocus: () => void;
  onBlur: () => void;
}

const EditableCommentRow: React.FC<Props> = ({
  fieldName,
  isUpdating,
  onFocus,
  onBlur,
}) => (
  <View className="px-screen my-5">
    <View className="flex-row items-center justify-between min-h-[20px] mb-2">
      <Typography className="text-caption text-neutral-500">
        Комментарий к записи
      </Typography>
      {isUpdating && (
        <ActivityIndicator size="small" color={colors.primary.blue[500]} />
      )}
    </View>
    <RhfTextField
      name={fieldName}
      placeholder="Оставьте комментарий"
      multiline
      numberOfLines={4}
      hideErrorText
      editable={!isUpdating}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  </View>
);

export default EditableCommentRow;
