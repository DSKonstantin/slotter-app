import React, { useState } from "react";
import { Button, StModal, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { View } from "react-native";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";

const CreateAdditionalServiceModal = () => {
  const [visible, setVisible] = useState(false);

  return (
    <>
      <Button
        title="Создать доп. услугу"
        buttonClassName="mb-6"
        variant="clear"
        onPress={() => setVisible(true)}
        rightIcon={
          <StSvg name="Add_round_fill" size={24} color={colors.neutral[900]} />
        }
      />

      <StModal visible={visible} onClose={() => setVisible(false)}>
        <Typography weight="semibold" className="text-display text-center">
          Новая доп. услуга
        </Typography>

        <View className="my-6 gap-3">
          <RhfTextField
            name="name-1"
            label="Название"
            placeholder="Например: Добавить масло"
          />

          <RhfTextField
            name="description-1"
            label="Краткое описание"
            placeholder="Содержание услуги"
          />

          <RhfTextField
            name="description-1"
            label="Стоимость (₽)"
            placeholder="Введите цену услуги"
          />
          <RhfTextField
            name="duration-1"
            label="Продолжительность (мин)"
            placeholder="Продолжительность"
          />
        </View>

        <View className="flex-row gap-2">
          <Button
            title="Отмена"
            variant="secondary"
            textVariant="accent"
            buttonClassName="flex-1"
            onPress={() => setVisible(false)}
          />
          <Button title="Создать" buttonClassName="flex-1" onPress={() => {}} />
        </View>
      </StModal>
    </>
  );
};

export default CreateAdditionalServiceModal;
