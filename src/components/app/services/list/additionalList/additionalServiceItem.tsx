import React, { useCallback, useMemo } from "react";
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
  onDrag?: () => void;
  onToggleActive: (id: number, nextValue: boolean) => void;
  onDelete?: (id: number, name: string) => void;
  onPress?: (id: number) => void;
};

const AdditionalServiceItem = ({
  item,
  isEditMode,
  isDragActive,
  onDrag,
  onToggleActive,
  onDelete,
  onPress,
}: AdditionalServiceItemProps) => {
  const formattedPrice = useMemo(
    () => formatRublesFromCents(item.price_cents),
    [item.price_cents],
  );

  const handleDeletePress = useCallback(() => {
    onDelete?.(item.id, item.name);
  }, [item.id, item.name, onDelete]);

  const handleToggle = useCallback(
    (nextValue: boolean) => {
      onToggleActive(item.id, nextValue);
    },
    [item.id, onToggleActive],
  );

  return (
    <Card
      title={item.name}
      subtitle={`${item.duration} мин | ${formattedPrice}`}
      active={isDragActive}
      className={item.is_active ? "" : "opacity-40"}
      pressArea="content"
      left={
        isEditMode && (
          <Pressable
            onLongPress={onDrag}
            accessibilityLabel="Reorder service"
            accessibilityRole="button"
          >
            <StSvg name="Drag" size={24} color={colors.neutral[900]} />
          </Pressable>
        )
      }
      right={
        isEditMode ? (
          <IconButton
            size="xs"
            onPress={handleDeletePress}
            accessibilityLabel={`Delete ${item.name}`}
            icon={
              <StSvg
                name="Trash_light"
                size={24}
                color={colors.accent.red[500]}
              />
            }
          />
        ) : (
          <Switch value={item.is_active} onChange={handleToggle} />
        )
      }
      onPress={onPress ? () => onPress(item.id) : undefined}
    />
  );
};

export default React.memo(AdditionalServiceItem);
