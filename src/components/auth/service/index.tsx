import React, { useState } from "react";
import * as Yup from "yup";
import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { StSvg, Typography, SelectField } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import useLayout from "@/src/hooks/useLayout";
import { RHFSelect } from "@/src/components/hookForm/rhf-select";
import { HOURS_OPTIONS } from "@/src/constants/hoursOptions";

type ServiceFormValues = {};

const data = Array(5)
  .fill(null)
  .map((_, i) => ({
    value: `Option ${i + 1}`,
  }));

const Service = () => {
  const VerifySchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {},
  });

  const onSubmit = (data: ServiceFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.schedule);
  };

  const [layout, onLayout] = useLayout();
  const [selectedItem, setSelectedItem] = useState(null);

  console.log(layout, "layout");

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);
  const [items, setItems] = useState([
    { label: "Apple 🍎", value: "apple" },
    { label: "Banana 🍌", value: "banana" },
    { label: "Orange 🍊", value: "orange" },
  ]);

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        header={<AuthHeader />}
        avoidKeyboard
        footer={
          <AuthFooter
            primary={{
              title: "Сохранить",
              onPress: methods.handleSubmit(onSubmit),
            }}
            secondary={{
              title: "Пропустить",
              onPress: () => {
                router.push(Routers.auth.schedule);
              },
            }}
          />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={2} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Первая услуга
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Добавь самую популярную
          </Typography>

          <View className="gap-2 mt-9">
            <RhfTextField name="name" label="Название" placeholder="Стрижка" />
          </View>
        </View>
        <View className="flex-row mt-3 gap-3">
          <View className="flex-1">
            <RhfTextField name="price" label="Цена" placeholder="1 500 ₽" />
          </View>
          <View className="flex-1">
            <RHFSelect
              name="fruit"
              label="Время"
              placeholder="1 час"
              items={HOURS_OPTIONS as any}
            />
          </View>
        </View>

        <View className="gap-2">
          <Typography weight="medium" className="text-caption text-gray">
            Фото услуги (необязательно)
          </Typography>

          <View className="p-6 border justify-center items-center border-gray rounded-3xl border-dashed gap-1">
            <StSvg name="layers" size={40} color="black" />
            <Typography weight="medium" className="text-body">
              Добавить фото
            </Typography>
          </View>

          <Typography weight="medium" className="text-caption text-gray">
            Постарайся выбрать крутые фотки, с ними клиентов будет больше
          </Typography>
        </View>
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default Service;
