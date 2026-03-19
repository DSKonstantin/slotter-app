import React from "react";
import { TouchableOpacity } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppDispatch } from "@/src/store/redux/store";
import { setFilterModalOpen } from "@/src/store/redux/slices/calendarSlice";

const FilteredSlotBlock: React.FC = () => {
  const dispatch = useAppDispatch();

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="flex-1 rounded-base flex-row items-center justify-between overflow-hidden border border-dashed border-neutral-200 bg-background px-4 mb-1"
      onPress={() => dispatch(setFilterModalOpen(true))}
    >
      <Typography className="text-body text-neutral-900">
        Скрыто фильтром
      </Typography>

      <StSvg name="Filter_alt_fill" size={24} color={colors.neutral[900]} />
    </TouchableOpacity>
  );
};

export default FilteredSlotBlock;
