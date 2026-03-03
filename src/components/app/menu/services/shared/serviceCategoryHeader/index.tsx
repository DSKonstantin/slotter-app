import React from "react";
import { Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type ServiceCategoryHeaderProps = {
  name: string;
  activeCount: number;
  totalCount: number;
  isEditMode: boolean;
  onDrag?: () => void;
};

const ServiceCategoryHeader = ({
  name,
  activeCount,
  totalCount,
  isEditMode,
  onDrag,
}: ServiceCategoryHeaderProps) => {
  return (
    <View className="flex-row justify-between">
      <View className="flex-row items-center gap-1">
        {isEditMode && (
          <Pressable
            onLongPress={onDrag}
            hitSlop={8}
            accessibilityLabel="Reorder category"
            accessibilityRole="button"
          >
            <StSvg name="Drag" size={16} color={colors.neutral[900]} />
          </Pressable>
        )}

        <Typography className="text-caption text-neutral-500">
          {name}
        </Typography>
      </View>

      <Typography weight="regular" className="text-caption text-neutral-500">
        {activeCount}/{totalCount} активно
      </Typography>
    </View>
  );
};

export default React.memo(ServiceCategoryHeader);
