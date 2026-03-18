import React from "react";
import { Pressable, View } from "react-native";
import { StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";

type ServiceCategoryHeaderProps = {
  name: string;
  activeCount: number;
  totalCount: number;
  isEditMode: boolean;
  isDragActive?: boolean;
  isExpanded?: boolean;
  onDrag?: () => void;
  onPress?: () => void;
};

const ServiceCategoryHeader = ({
  name,
  activeCount,
  totalCount,
  isEditMode,
  isDragActive = false,
  isExpanded = true,
  onDrag,
  onPress,
}: ServiceCategoryHeaderProps) => {
  return (
    <View className="flex-row justify-between">
      <View className="flex-row items-center gap-1">
        {isEditMode && (
          <Pressable
            onLongPress={onDrag}
            delayLongPress={100}
            hitSlop={8}
            accessibilityLabel="Reorder category"
            accessibilityRole="button"
          >
            <StSvg
              name="Drag"
              size={16}
              color={
                isDragActive ? colors.primary.blue[500] : colors.neutral[900]
              }
            />
          </Pressable>
        )}

        <Pressable className="flex-row items-center gap-1" onPress={onPress}>
          <Typography
            weight="regular"
            className={`text-caption ${isDragActive ? "text-primary-blue-500" : "text-neutral-500"}`}
          >
            {name}
          </Typography>

          <StSvg
            name={isExpanded ? "Expand_up_light" : "Expand_down_light"}
            size={16}
            color={
              isDragActive ? colors.primary.blue[500] : colors.neutral[500]
            }
          />
        </Pressable>
      </View>

      <Typography
        weight="regular"
        className={`text-caption ${isDragActive ? "text-primary-blue-500" : "text-neutral-500"}`}
      >
        {activeCount}/{totalCount} активно
      </Typography>
    </View>
  );
};

export default React.memo(ServiceCategoryHeader);
