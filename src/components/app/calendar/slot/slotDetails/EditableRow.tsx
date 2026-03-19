import React from "react";
import { View } from "react-native";
import { IconButton, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { colors } from "@/src/styles/colors";
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
      <View className="flex-row items-center gap-1 flex-1 justify-end">
        {editing ? (
          <View className="flex-1">
            <RhfTextField
              name={fieldName}
              placeholder={placeholder}
              keyboardType="numeric"
              hideErrorText
              autoFocus
              size="xs"
            />
          </View>
        ) : (
          <Typography
            weight="regular"
            className="text-body text-neutral-900 flex-shrink text-right"
          >
            {displayValue}
          </Typography>
        )}
        {(canEdit || editing) && (
          <IconButton
            size="xs"
            loading={editing && isUpdating}
            onPress={editing ? onSave : onEdit}
            icon={
              <StSvg
                name={editing ? "Check_round_fill" : "Edit_light"}
                size={20}
                color={editing ? colors.primary.blue[500] : colors.neutral[500]}
              />
            }
          />
        )}
      </View>
    }
  />
);

export default EditableRow;
