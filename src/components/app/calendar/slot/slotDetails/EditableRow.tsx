import React from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { RhfEditableRowInput } from "./EditableRowInput";
import InfoRow from "./InfoRow";

interface EditableRowProps {
  label: string;
  displayValue: string;
  fieldName: string;
  editing: boolean;
  canEdit: boolean;
  isUpdating: boolean;
  placeholder: string;
  onEdit: () => void;
  onSave: () => void;
  divider?: boolean;
}

const EditableRow = ({
  label,
  displayValue,
  fieldName,
  editing,
  canEdit,
  isUpdating,
  placeholder,
  onEdit,
  onSave,
  divider = true,
}: EditableRowProps) => (
  <InfoRow
    label={label}
    divider={divider}
    right={
      editing ? (
        <View className="flex-row items-center gap-1 flex-1 justify-end">
          <View className="flex-1">
            <RhfEditableRowInput
              name={fieldName}
              placeholder={placeholder}
              keyboardType="numeric"
              returnKeyType="done"
              submitBehavior="blurAndSubmit"
              autoFocus
              editable={!isUpdating}
              onBlur={onSave}
              onSubmitEditing={onSave}
            />
          </View>
          {isUpdating && (
            <ActivityIndicator size="small" color={colors.primary.blue[500]} />
          )}
        </View>
      ) : (
        <Pressable
          onPress={canEdit ? onEdit : undefined}
          disabled={!canEdit}
          hitSlop={8}
          className="flex-row items-center gap-1 flex-1 justify-end active:opacity-70"
        >
          <Typography
            weight="regular"
            className="text-body text-neutral-900 flex-shrink text-right"
          >
            {displayValue}
          </Typography>
          {canEdit && (
            <StSvg name="Edit_light" size={20} color={colors.neutral[500]} />
          )}
        </Pressable>
      )
    }
  />
);

export default EditableRow;
