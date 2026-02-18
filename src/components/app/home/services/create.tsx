import * as Yup from "yup";
import React, { useState } from "react";
import ToolbarTop from "@/src/components/navigation/toolbarTop";
import {
  Badge,
  Divider,
  IconButton,
  Button,
  Item,
  StSvg,
  Typography,
  Card,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { TAB_BAR_HEIGHT, TOOLBAR_HEIGHT } from "@/src/constants/tabs";
import { Pressable, View, StyleSheet, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import {
  ServiceImagesPicker,
  ServicePhotosValue,
} from "@/src/components/shared/imagePicker/serviceImagesPicker";

type FormValues = {
  name: string;
  price: string;
  duration: string;
  categoryId: number | null;
};

const schema = Yup.object({
  name: Yup.string().required("Введите название"),
  price: Yup.string().required("Введите цену"),
  duration: Yup.string().required("Введите длительность"),
  categoryId: Yup.number().required("Выберите категорию"),
});

const categoriesMock = [
  { id: 1, name: "Стрижки" },
  { id: 2, name: "Окрашивание" },
  { id: 3, name: "Лечение" },
];

const AppCreateService = () => {
  const [photos, setPhotos] = useState<ServicePhotosValue>({
    titlePhoto: { assets: [], max: 1 },
    otherPhoto: { assets: [], max: 4 },
  });
  const { top, bottom } = useSafeAreaInsets();

  const methods = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      price: "",
      duration: "",
      categoryId: null,
      additionalServices: [
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
        {
          id: "3",
          title: "Массаж головы",
          duration: 20,
          price: 500,
        },
      ],
    },
  });

  const { setValue, watch, handleSubmit, control } = methods;

  const { fields: additionalServices, remove } = useFieldArray({
    control,
    name: "additionalServices",
  });

  const selectedCategoryId = watch("categoryId");

  const onSubmit = (data: FormValues) => {
    console.log("CREATE SERVICE:", data);
  };

  return (
    <>
      <ToolbarTop title="Создать услугу" />

      <FormProvider {...methods}>
        <View
          className="flex-1"
          style={{
            paddingTop: TOOLBAR_HEIGHT + top,
          }}
        >
          <ScrollView
            className="px-screen"
            contentContainerStyle={{
              paddingBottom: TAB_BAR_HEIGHT + bottom + 16,
            }}
          >
            <Typography className="text-caption text-neutral-500 mb-2">
              Категория
            </Typography>

            <View className="flex-row flex-wrap gap-2 mb-2">
              {categoriesMock.map((category) => {
                const isSelected = selectedCategoryId === category.id;

                return (
                  <Pressable
                    key={category.id}
                    onPress={() =>
                      setValue("categoryId", category.id, {
                        shouldValidate: true,
                      })
                    }
                  >
                    <Badge
                      title={category.name}
                      variant={isSelected ? "accent" : "secondary"}
                    />
                  </Pressable>
                );
              })}
            </View>

            <Button
              title="Создать новую категорию"
              variant="clear"
              onPress={() => {}}
              rightIcon={
                <StSvg
                  name="Add_ring_fill_light"
                  size={18}
                  color={colors.neutral[900]}
                />
              }
            />

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
                      rightIcon={
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
              onPress={() => {}}
              rightIcon={
                <StSvg
                  name="Add_round_fill"
                  size={24}
                  color={colors.neutral[900]}
                />
              }
            />

            <ServiceImagesPicker value={photos} onChange={setPhotos} />
          </ScrollView>
        </View>
      </FormProvider>
    </>
  );
};

const styles = StyleSheet.create({
  textarea: {
    minHeight: 110,
  },
});

export default AppCreateService;
