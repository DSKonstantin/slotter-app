import React, { useCallback } from "react";
import { TouchableOpacity, View } from "react-native";
import { HatchPattern, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppDispatch } from "@/src/store/redux/store";
import { setFilterModalOpen } from "@/src/store/redux/slices/calendarSlice";

const FilteredSlotBlock: React.FC = () => {
  const dispatch = useAppDispatch();

  const handleOpenFilter = useCallback(
    () => dispatch(setFilterModalOpen(true)),
    [dispatch],
  );

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      className="relative flex-1 rounded-base flex-row items-center overflow-hidden border border-neutral-200 bg-background px-4"
      onPress={handleOpenFilter}
    >
      <HatchPattern />
      <View className="items-center flex-row">
        <StSvg name="View_hide_fill" size={24} color={colors.neutral[900]} />
        <Typography className="text-body text-neutral-900">Скрыто</Typography>
      </View>
    </TouchableOpacity>
  );
};

export default FilteredSlotBlock;
