import React from "react";
import { View, Pressable } from "react-native";
import { RenderItemParams } from "react-native-draggable-flatlist";

import { Card, StSvg, Switch } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import type { ServiceCategory } from "@/src/store/redux/services/api-types";

type CategoryItemCardProps = {
  item: ServiceCategory;
  drag: () => void;
  isActive: boolean;
  onToggleActive: (categoryId: number, nextValue: boolean) => void;
  onPress: (category: ServiceCategory) => void;
};

const CategoryItemCard = ({
  item,
  drag,
  isActive,
  onToggleActive,
  onPress,
}: CategoryItemCardProps) => {
  return (
    <Card
      title={item.name}
      pressArea="content"
      active={isActive}
      className={item.is_active ? "" : "opacity-40"}
      subtitle={`${item.activeServicesCount ?? item.services?.length ?? 0} услуг`}
      left={
        <Pressable
          onLongPress={drag}
          delayLongPress={100}
          hitSlop={8}
          accessibilityLabel="Reorder category"
          accessibilityRole="button"
        >
          <View className="flex-row items-center gap-2">
            <StSvg name="Drag" size={24} color={colors.neutral[900]} />
            {item.color && (
              <View
                className={"w-5 h-5 rounded-full"}
                style={{ backgroundColor: item.color }}
              />
            )}
          </View>
        </Pressable>
      }
      right={
        <Switch
          value={item.is_active}
          onChange={(nextValue) => onToggleActive(item.id, nextValue)}
        />
      }
      onPress={() => onPress(item)}
    />
  );
};

export default React.memo(CategoryItemCard);
