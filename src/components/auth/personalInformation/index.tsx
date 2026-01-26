import React, { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { AuthScreenLayout } from "@/src/components/auth/layout";
import AuthHeader from "@/src/components/auth/layout/header";
import AuthFooter from "@/src/components/auth/layout/footer";
import { View } from "react-native";
import { Avatar, Divider, Item, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { StepProgress } from "@/src/components/ui/StepProgress";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import RHFSwitch from "@/src/components/hookForm/rhf-switch";
import { ImagePickerTrigger } from "@/src/components/ui/ImagePickerTrigger";

type PersonalInformationFormValues = {};

const PersonalInformation = () => {
  const VerifySchema = Yup.object().shape({});

  const methods = useForm({
    resolver: yupResolver(VerifySchema),
    defaultValues: {
      name: "",
      surname: "",
      profession: "",
      atHome: false,
      online: false,
      onRoad: false,
    },
  });

  const onSubmit = (data: PersonalInformationFormValues) => {
    console.log("SUBMIT", data);
    router.push(Routers.auth.service);
  };

  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  return (
    <FormProvider {...methods}>
      <AuthScreenLayout
        avoidKeyboard
        header={<AuthHeader />}
        footer={
          <AuthFooter
            primary={{
              title: "Далее",
              onPress: methods.handleSubmit(onSubmit),
            }}
          />
        }
      >
        <View className="mt-4">
          <StepProgress steps={3} currentStep={1} />
        </View>
        <View className="mt-8 gap-2">
          <Typography weight="semibold" className="text-display mb-2">
            Твоя визитка
          </Typography>
          <Typography weight="medium" className="text-body text-gray">
            Чтобы клиенты знали, к кому идут
          </Typography>

          <View className="items-center my-4">
            <ImagePickerTrigger
              title="Загрузить аватар"
              onPick={(asset) => setAvatarUri(asset.uri)}
              options={{ aspect: [1, 1] }}
            >
              <Avatar
                size="xl"
                uri={avatarUri ?? undefined}
                fallbackIcon={<StSvg name="Camera" size={40} color="#8E8E93" />}
              />
            </ImagePickerTrigger>
          </View>
        </View>

        <View className="gap-2">
          <RhfTextField name="name" label="Имя" placeholder="Иван" />
          <RhfTextField name="surname" label="Фамилия" placeholder="Иванов" />
          <RhfTextField
            name="profession"
            label="Профессия"
            placeholder="Барбер"
          />
        </View>

        <Divider />

        <Typography weight="medium" className="text-gray text-caption mt-5">
          Формат работы
        </Typography>

        <View className="mt-2 mb-5 gap-2">
          <Item title="Дома/в студии" right={<RHFSwitch name="atHome" />} />
          <Item title="Онлайн" right={<RHFSwitch name="online" />} />
          <Item title="На выезд" right={<RHFSwitch name="onRoad" />} />
        </View>

        <RhfTextField
          name="address"
          label="Адрес"
          placeholder="Москва, ул. Пушкина, 5"
        />
      </AuthScreenLayout>
    </FormProvider>
  );
};

export default PersonalInformation;
