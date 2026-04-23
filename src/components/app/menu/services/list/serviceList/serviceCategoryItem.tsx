import React, { memo, useCallback, useMemo, useState } from "react";
import { Alert, LayoutAnimation, Pressable, View } from "react-native";
import {
  NestableDraggableFlatList,
  RenderItemParams,
} from "react-native-draggable-flatlist";

import { Button, Card, IconButton, StSvg, Tag } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Service, ServiceCategory } from "@/src/store/redux/services/api-types";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import { useDeleteServiceMutation } from "@/src/store/redux/services/api/servicesApi";
import { toast } from "@backpackapp-io/react-native-toast";
import ServiceCategoryHeader from "@/src/components/app/menu/services/shared/serviceCategoryHeader";
import { getApiErrorMessage } from "@/src/utils/apiError";

type ServiceCategoryItemProps = {
  category: ServiceCategory;
  isEditMode: boolean;
  isDragActive?: boolean;
  onDrag?: () => void;
  onServicePress: (serviceId: number, categoryId: number) => void;
  onCreateServicePress: (categoryId: number) => void;
  onServicesReorder: (
    categoryId: number,
    nextServices: Service[],
    from: number,
    to: number,
  ) => void | Promise<void>;
};

const ServiceCategoryItem = ({
  category,
  isEditMode,
  isDragActive = false,
  onDrag,
  onServicePress,
  onCreateServicePress,
  onServicesReorder,
}: ServiceCategoryItemProps) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [deleteService, { isLoading: isDeleting }] = useDeleteServiceMutation();

  const handleToggleExpanded = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsExpanded((prev) => !prev);
  }, []);

  const getDeletePressHandler = useCallback(
    (serviceId: number) => () => {
      if (isDeleting) return;

      Alert.alert("Удалить услугу?", "Это действие нельзя отменить", [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: () => {
            void deleteService({ categoryId: category.id, id: serviceId })
              .unwrap()
              .catch((error) => {
                toast.error(
                  getApiErrorMessage(error, "Не удалось удалить услугу"),
                );
              });
          },
        },
      ]);
    },
    [category.id, deleteService, isDeleting],
  );

  const activeServicesCount = useMemo(
    () => category.services?.filter((service) => service.is_active).length ?? 0,
    [category.services],
  );

  const services = useMemo(() => category.services ?? [], [category.services]);

  return (
    <View className="gap-2">
      <ServiceCategoryHeader
        name={category.name}
        activeCount={activeServicesCount}
        totalCount={category.services?.length ?? 0}
        isEditMode={isEditMode}
        onDrag={onDrag}
        isDragActive={isDragActive}
        isExpanded={isExpanded}
        onPress={handleToggleExpanded}
      />

      {isExpanded && (
        <View className="gap-2">
          {services.length ? (
            isEditMode ? (
              <NestableDraggableFlatList
                data={services}
                keyExtractor={(service) => String(service.id)}
                accessibilityRole="list"
                onDragEnd={({ data, from, to }) =>
                  onServicesReorder(category.id, data, from, to)
                }
                ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
                renderItem={({
                  item: service,
                  drag,
                  isActive,
                }: RenderItemParams<Service>) => (
                  <Card
                    title={service.name}
                    titleProps={{
                      numberOfLines: 1,
                      ellipsizeMode: "tail",
                    }}
                    subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
                    titleAccessory={
                      !service.is_active ? (
                        <Tag title="скрыто" size="sm" />
                      ) : undefined
                    }
                    active={isActive}
                    left={
                      <Pressable
                        onLongPress={drag}
                        hitSlop={8}
                        accessibilityLabel="Reorder service"
                        accessibilityRole="button"
                      >
                        <StSvg
                          name="Drag"
                          size={24}
                          color={colors.neutral[900]}
                        />
                      </Pressable>
                    }
                    right={
                      <IconButton
                        size="xs"
                        disabled={isDeleting}
                        onPress={getDeletePressHandler(service.id)}
                        accessibilityLabel={`Delete ${service.name}`}
                        icon={
                          <StSvg
                            name="Trash_light"
                            size={24}
                            color={colors.accent.red[500]}
                          />
                        }
                      />
                    }
                    pressArea="content"
                    onPress={() => onServicePress(service.id, category.id)}
                  />
                )}
              />
            ) : (
              <View style={{ gap: 8 }} accessibilityRole="list">
                {services.map((service) => (
                  <Card
                    key={service.id}
                    title={service.name}
                    titleProps={{
                      numberOfLines: 1,
                      ellipsizeMode: "tail",
                    }}
                    subtitle={`${service.duration} мин | ${formatRublesFromCents(service.price_cents)}`}
                    titleAccessory={
                      !service.is_active ? (
                        <Tag title="скрыто" size="sm" />
                      ) : undefined
                    }
                    right={
                      <StSvg
                        name="Expand_right_light"
                        size={24}
                        color={colors.neutral[500]}
                      />
                    }
                    pressArea="card"
                    onPress={() => onServicePress(service.id, category.id)}
                  />
                ))}
              </View>
            )
          ) : (
            <Button
              title="Создать услугу"
              onPress={() => onCreateServicePress(category.id)}
              variant="secondary"
              rightIcon={
                <StSvg
                  name="Add_ring_fill_light"
                  size={18}
                  color={colors.neutral[900]}
                />
              }
            />
          )}
        </View>
      )}
    </View>
  );
};

export default memo(ServiceCategoryItem);
