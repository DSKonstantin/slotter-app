import React, { useRef } from "react";
import { RefreshControl, ScrollView, View } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { Button, Divider, Item, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { RhfDurationPicker } from "@/src/components/hookForm/rhf-duration-picker";
import {
  createDefaultServicePhotos,
  ServiceImagesPicker,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { colors } from "@/src/styles/colors";
import ServiceCategorySelect from "@/src/components/app/services/service/serviceForm/serviceCategorySelect";
import CreateAdditionalService from "@/src/components/app/services/service/createAdditionalService";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useRefresh } from "@/src/hooks/useRefresh";

export const defaultServicePhotos: ServicePhotosValue = {
  ...createDefaultServicePhotos(),
};

type ServiceFormBodyProps = {
  onSubmit: () => void;
  onDelete?: () => void;
  refetch?: () => Promise<unknown> | unknown;
  loading: boolean;
  disabled?: boolean;
  insets: { topInset: number; bottomInset: number };
  isEdit?: boolean;
};

const ServiceFormBody = ({
  isEdit,
  onSubmit,
  onDelete,
  refetch,
  loading,
  disabled = false,
  insets,
}: ServiceFormBodyProps) => {
  const {
    control,
    handleSubmit,
    formState: { isDirty },
  } = useFormContext();
  const { refreshing, onRefresh } = useRefresh(refetch ?? (() => {}));
  const scrollRef = useRef<ScrollView>(null);

  const scrollToTop = () =>
    scrollRef.current?.scrollTo({ y: 0, animated: true });

  const {
    field: { value: photos, onChange: setPhotos },
  } = useController({
    name: "photos",
    control,
  });

  const {
    field: { value: isActive, onChange: setIsActive },
  } = useController({
    name: "isActive",
    control,
  });

  return (
    <KeyboardAwareScrollView
      ref={scrollRef}
      className="flex-1"
      bottomOffset={BOTTOM_OFFSET}
      contentContainerStyle={{
        paddingTop: insets.topInset,
        paddingBottom: insets.bottomInset + 8,
      }}
      refreshControl={
        refetch && !isDirty ? (
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        ) : undefined
      }
    >
      <ServiceCategorySelect />

      <View className="mt-5 gap-1 px-screen">
        <RhfTextField
          name="name"
          label="Название услуги"
          placeholder="Например: Стрижка"
        />
        <RhfTextField
          name="price"
          label="Цена"
          placeholder="Например: 3500"
          keyboardType="numeric"
        />
        <RhfDurationPicker
          name="duration"
          label="Длительность"
          placeholder="Выберите длительность"
        />

        <RhfTextField
          name="description"
          label="Описание"
          hideErrorText
          multiline
          numberOfLines={4}
          maxLength={40}
          placeholder="Расскажите об услуге подробнее"
        />
      </View>

      <View className="px-screen">
        <Divider className="mt-8 mb-4" />

        <Item
          title="Доступно для онлайн-записи"
          right={<RHFSwitch name="isAvailableOnline" />}
        />
      </View>

      <CreateAdditionalService />

      <View className="px-screen mt-4">
        <ServiceImagesPicker value={photos} onChange={setPhotos} />

        <Button
          title="Сохранить услугу"
          buttonClassName="mt-4"
          disabled={loading || disabled}
          loading={loading}
          onPress={handleSubmit(onSubmit, scrollToTop)}
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
        />
        <Button
          title={isActive ? "Скрыть услугу" : "Показать услугу"}
          variant="clear"
          buttonClassName="mt-4"
          disabled={loading || disabled}
          onPress={() => setIsActive(!isActive)}
          rightIcon={
            <StSvg
              name={isActive ? "View_hide_fill" : "View_fill"}
              size={24}
              color={colors.neutral[900]}
            />
          }
        />

        {isEdit && (
          <Button
            title="Удалить"
            variant="clear"
            buttonClassName="mt-16"
            textClassName="text-accent-red-500"
            disabled={loading || disabled}
            onPress={onDelete ? onDelete : () => {}}
            rightIcon={
              <StSvg name="Trash" size={24} color={colors.accent.red[500]} />
            }
          />
        )}
      </View>
    </KeyboardAwareScrollView>
  );
};

export default ServiceFormBody;
