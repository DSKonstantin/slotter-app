import React from "react";
import { View } from "react-native";

import { Tag, Typography } from "@/src/components/ui";
import type { TemplateVariable } from "@/src/store/redux/services/api-types";

type VariablePickerProps = {
  variables: TemplateVariable[];
  onInsert: (variable: TemplateVariable) => void;
};

const VariablePicker = ({ variables, onInsert }: VariablePickerProps) => (
  <View className="flex-row flex-wrap gap-x-2 gap-y-3">
    {variables.map((variable) => (
      <View key={variable.key} className="gap-1">
        <Typography numberOfLines={1} className="text-caption text-neutral-500">
          {variable.title}
        </Typography>
        <Tag
          title={`{{${variable.key}}}`}
          variant="info"
          size="sm"
          onPress={() => onInsert(variable)}
        />
      </View>
    ))}
  </View>
);

export default VariablePicker;
