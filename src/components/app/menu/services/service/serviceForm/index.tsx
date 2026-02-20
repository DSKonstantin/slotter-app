import React, { useState } from "react";
import { ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useFieldArray, useFormContext } from "react-hook-form";

import {
  Button,
  Card,
  Divider,
  IconButton,
  Item,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import {
  ServiceImagesPicker,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import ServiceCategorySelect from "@/src/components/app/menu/services/service/serviceForm/serviceCategorySelect";

export type AdditionalServiceForm = {
  id: string;
  title: string;
  duration: number;
  price: number;
};

export type ServiceFormValues = {
  name: string;
  price: string;
  duration: string;
  categoryId: number | null;
  description: string;
  online: boolean;
  additionalServices: AdditionalServiceForm[];
};

export const defaultAdditionalServices: AdditionalServiceForm[] = [
  {
    id: "1",
    title: "Укладка пастой",
    duration: 10,
    price: 200,
  },
  {
    id: "2",
    title: "Массаж головы",
    duration: 20,
    price: 500,
  },
];

const defaultPhotos: ServicePhotosValue = {
  titlePhoto: { assets: [], max: 1 },
  otherPhoto: { assets: [], max: 4 },
};

type ServiceFormBodyProps = {
  topInset: number;
  bottomInset: number;
};

const ServiceFormBody = ({ topInset, bottomInset }: ServiceFormBodyProps) => {
  const [photos, setPhotos] = useState<ServicePhotosValue>(defaultPhotos);
  const [isAdditionalServiceModalVisible, setAdditionalServiceModalVisible] =
    useState(false);
  const [additionalServiceTitle, setAdditionalServiceTitle] = useState("");
  const [additionalServiceDuration, setAdditionalServiceDuration] =
    useState("");
  const [additionalServicePrice, setAdditionalServicePrice] = useState("");
  const { control } = useFormContext<ServiceFormValues>();
  const {
    fields: additionalServices,
    remove,
    append,
  } = useFieldArray({
    control,
    name: "additionalServices",
  });

  const handleAddAdditionalService = () => {
    const normalizedTitle = additionalServiceTitle.trim();
    const parsedDuration = Number(additionalServiceDuration);
    const parsedPrice = Number(additionalServicePrice);

    if (
      !normalizedTitle ||
      Number.isNaN(parsedDuration) ||
      Number.isNaN(parsedPrice)
    ) {
      return;
    }

    append({
      id: String(Date.now()),
      title: normalizedTitle,
      duration: parsedDuration,
      price: parsedPrice,
    });

    setAdditionalServiceTitle("");
    setAdditionalServiceDuration("");
    setAdditionalServicePrice("");
    setAdditionalServiceModalVisible(false);
  };

  return (
    <ScrollView
      className="px-screen"
      contentContainerStyle={{
        paddingTop: topInset,
        paddingBottom: TAB_BAR_HEIGHT + bottomInset + 16,
      }}
    >
      <ServiceCategorySelect />

      <View className="mt-5 gap-2">
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

      <Divider className="my-8" />

      <Item
        title="Доступно для онлайн-записи"
        right={<RHFSwitch name="online" />}
      />

      <Typography className="text-caption text-neutral-500 mt-5 mb-2">
        Дополнительные услуги
      </Typography>

      <ScrollView
        className="mb-2"
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        <View className="flex-row gap-2 py-1">
          {additionalServices.map((service, index) => (
            <View key={service.id} className="relative">
              <Card
                title={service.title}
                subtitle={`${service.duration} мин | ${service.price} ₽`}
                right={
                  <StSvg
                    name="Edit_light"
                    size={24}
                    color={colors.neutral[500]}
                  />
                }
              />

              <IconButton
                onPress={() => remove(index)}
                size="xs"
                buttonClassName="absolute -top-2 -right-2 bg-background rounded-full"
                icon={
                  <StSvg
                    name="Close_round_fill_light"
                    size={18}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>
          ))}
        </View>
      </ScrollView>
      <Button
        title="Создать доп. услугу"
        variant="clear"
        onPress={() => setAdditionalServiceModalVisible(true)}
        rightIcon={
          <StSvg name="Add_round_fill" size={24} color={colors.neutral[900]} />
        }
      />

      <ServiceImagesPicker value={photos} onChange={setPhotos} />

      <StModal
        visible={isAdditionalServiceModalVisible}
        onClose={() => setAdditionalServiceModalVisible(false)}
      >
        <Typography weight="semibold" className="text-display text-center">
          Новая доп. услуга
        </Typography>

        <View className="my-6 gap-3">
          <TextInput
            value={additionalServiceTitle}
            onChangeText={setAdditionalServiceTitle}
            placeholder="Название"
            className="h-12 rounded-base border border-neutral-200 px-4 bg-background"
          />
          <TextInput
            value={additionalServiceDuration}
            onChangeText={setAdditionalServiceDuration}
            placeholder="Длительность (мин)"
            keyboardType="numeric"
            className="h-12 rounded-base border border-neutral-200 px-4 bg-background"
          />
          <TextInput
            value={additionalServicePrice}
            onChangeText={setAdditionalServicePrice}
            placeholder="Цена"
            keyboardType="numeric"
            className="h-12 rounded-base border border-neutral-200 px-4 bg-background"
          />
        </View>

        <View className="flex-row gap-2">
          <Button
            title="Отмена"
            variant="secondary"
            textVariant="accent"
            buttonClassName="flex-1"
            onPress={() => setAdditionalServiceModalVisible(false)}
          />
          <Button
            title="Создать"
            buttonClassName="flex-1"
            onPress={handleAddAdditionalService}
          />
        </View>
      </StModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textarea: {
    minHeight: 110,
  },
});

export default ServiceFormBody;
