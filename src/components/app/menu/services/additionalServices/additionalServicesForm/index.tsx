import React from "react";
import { View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { Button, Item, StSvg } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import DurationField from "@/src/components/app/menu/services/shared/durationField";

type AdditionalServiceFormBodyProps = {
  onSubmit: () => void;
  onDelete?: () => void;
  loading: boolean;
  insets: { topInset: number; bottomInset: number };
  isEdit?: boolean;
};

const AdditionalServicesForm = ({
  isEdit,
  onSubmit,
  onDelete,
  loading,
  insets,
}: AdditionalServiceFormBodyProps) => {
  return (
    <>
      <KeyboardAwareScrollView
        contentContainerStyle={{
          paddingTop: insets.topInset,
        }}
      >
        <View className="px-screen">
          <Item title="Показать" right={<RHFSwitch name="isActive" />} />
        </View>

        <View className="mt-5 gap-1 px-screen">
          <RhfTextField
            name="name"
            label="Название"
            placeholder="Например: Добавить масло"
          />
          <RhfTextField
            name="description"
            label="Краткое описание"
            placeholder="Содержание услуги"
          />
          <RhfTextField
            name="price"
            label="Стоимость (₽)"
            placeholder="Введите цену услуги"
          />
          <DurationField
            name="duration"
            placeholder="60"
            presets={[20, 30, 60, 90]}
          />
        </View>
      </KeyboardAwareScrollView>
      <View
        className="gap-2 px-screen mb-2"
        style={{
          paddingBottom: insets.bottomInset,
        }}
      >
        <Button
          title="Создать"
          onPress={onSubmit}
          rightIcon={
            <StSvg name="Check_fill" size={24} color={colors.neutral[0]} />
          }
        />
        {isEdit && onDelete && (
          <Button
            title="Удалить услугу"
            variant="clear"
            textClassName="text-accent-red-500"
            onPress={onDelete}
            rightIcon={
              <StSvg name="Trash" size={24} color={colors.accent.red[500]} />
            }
          />
        )}
      </View>
    </>
  );
};

export default AdditionalServicesForm;
