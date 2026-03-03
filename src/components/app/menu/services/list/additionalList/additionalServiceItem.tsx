import React from "react";
import { Pressable } from "react-native";

import { Card, IconButton, StSvg, Switch } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";

export type AdditionalListItem = {
  id: number;
  name: string;
  duration: number;
  price_cents: number;
  is_active: boolean;
};

type AdditionalServiceItemProps = {
  item: AdditionalListItem;
  isEditMode: boolean;
  isDragActive: boolean;
  onDrag: () => void;
  onToggleActive: (id: number, nextValue: boolean) => void;
  onPress?: (id: number) => void;
};

const AdditionalServiceItem = ({
  item,
  isEditMode,
  isDragActive,
  onDrag,
  onToggleActive,
  onPress,
}: AdditionalServiceItemProps) => {
  return (
    <Card
      title={item.name}
      subtitle={`${item.duration} мин | ${formatRublesFromCents(item.price_cents)}`}
      active={isDragActive}
      className={item.is_active ? "" : "opacity-40"}
      left={
        isEditMode && (
          <Pressable onLongPress={onDrag} delayLongPress={100} hitSlop={8}>
            <StSvg name="Drag" size={24} color={colors.neutral[900]} />
          </Pressable>
        )
      }
      right={
        isEditMode ? (
          <IconButton
            size="xs"
            icon={
              <StSvg
                name="Trash_light"
                size={24}
                color={colors.accent.red[500]}
              />
            }
          />
        ) : (
          <Switch
            value={item.is_active}
            onChange={(nextValue) => onToggleActive(item.id, nextValue)}
          />
        )
      }
      onPress={onPress ? () => onPress(item.id) : undefined}
    />
  );
};

export default AdditionalServiceItem;
