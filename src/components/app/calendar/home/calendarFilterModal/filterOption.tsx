import React from "react";
import { TouchableOpacity } from "react-native";
import { Checkbox, Typography } from "@/src/components/ui";

type FilterOptionProps = {
  label: string;
  value: boolean;
  onPress: () => void;
};

const FilterOption: React.FC<FilterOptionProps> = ({
  label,
  value,
  onPress,
}) => (
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={onPress}
    className="py-4 px-5 flex-row items-center bg-background-surface rounded-2xl gap-2.5"
  >
    <Checkbox pressable={false} value={value} />
    <Typography weight="regular" className="text-body">
      {label}
    </Typography>
  </TouchableOpacity>
);

export default FilterOption;
