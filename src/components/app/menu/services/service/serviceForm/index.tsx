import React from "react";
import { StyleSheet, View } from "react-native";
import { useController, useFormContext } from "react-hook-form";

import { Button, Divider, Item, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import {
  createDefaultServicePhotos,
  ServiceImagesPicker,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { colors } from "@/src/styles/colors";
import ServiceCategorySelect from "@/src/components/app/menu/services/service/serviceForm/serviceCategorySelect";
import CreateAdditionalService from "@/src/components/app/menu/services/service/createAdditionalService";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export const defaultServicePhotos: ServicePhotosValue = {
  ...createDefaultServicePhotos(),
};

type ServiceFormBodyProps = {
  onSubmit: () => void;
  onDelete?: () => void;
  loading: boolean;
  insets: { topInset: number; bottomInset: number };
  isEdit?: boolean;
};

const ServiceFormBody = ({
  isEdit,
  onSubmit,
  onDelete,
  loading,
  insets,
}: ServiceFormBodyProps) => {
  const { control } = useFormContext();

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
      className="flex-1"
      contentContainerStyle={{
        paddingTop: insets.topInset,
        paddingBottom: insets.bottomInset + 16,
      }}
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
        <RhfTextField
          name="duration"
          label="Длительность (мин)"
          placeholder="Например: 60"
          keyboardType="numeric"
        />

        <RhfTextField
          name="description"
          label="Описание"
          hideErrorText
          multiline
          numberOfLines={4}
          maxLength={40}
          style={styles.textarea}
          placeholder="Расскажите об услуге подробнее"
        />
      </View>

      <View className="px-screen">
        <Divider className="my-8" />

        <Item
          title="Доступно для онлайн-записи"
          right={<RHFSwitch name="isAvailableOnline" />}
        />
      </View>

      <CreateAdditionalService />

      <View className="px-screen">
        <ServiceImagesPicker value={photos} onChange={setPhotos} />

        <Button
          title="Сохранить услугу"
          buttonClassName="mt-4"
          disabled={loading}
          loading={loading}
          onPress={onSubmit}
          rightIcon={
            <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
          }
        />
        <Button
          title={isActive ? "Скрыть услугу" : "Показать услугу"}
          variant="clear"
          buttonClassName="mt-4"
          disabled={loading}
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
            disabled={loading}
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

const styles = StyleSheet.create({
  textarea: {
    paddingTop: 10,
    minHeight: 110,
  },
});

export default ServiceFormBody;
