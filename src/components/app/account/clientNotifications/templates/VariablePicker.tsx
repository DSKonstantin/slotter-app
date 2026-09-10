import React from "react";
import { View } from "react-native";

import { Tag } from "@/src/components/ui";
import type { TemplateVariable } from "./templateVariables";

type VariablePickerProps = {
  variables: TemplateVariable[];
  onInsert: (variable: TemplateVariable) => void;
};

const VariablePicker = ({ variables, onInsert }: VariablePickerProps) => (
  <View className="flex-row flex-wrap gap-2">
    {variables.map((variable) => (
      <Tag
        key={variable.token}
        title={variable.label}
        variant="info"
        size="sm"
        onPress={() => onInsert(variable)}
      />
    ))}
  </View>
);

export default VariablePicker;
