import React, { useCallback } from "react";
import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";

const ClientCreateSchema = Yup.object({
  name: Yup.string().required("Укажите имя"),
  phone: Yup.string(),
  comment: Yup.string(),
});

type ClientCreateFormValues = Yup.InferType<typeof ClientCreateSchema>;

const ClientCreate = () => {
  const { bottom } = useSafeAreaInsets();

  const methods = useForm<ClientCreateFormValues>({
    resolver: yupResolver(ClientCreateSchema),
    defaultValues: {
      name: "",
      phone: "",
      comment: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = useCallback(async (_values: ClientCreateFormValues) => {
    try {
      // TODO: connect real API
      toast.success("Клиент создан");
      router.back();
    } catch {
      toast.error("Не удалось создать клиента");
    }
  }, []);

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Новый клиент">
        {({ topInset }) => (
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingBottom: TAB_BAR_HEIGHT + bottom + 24,
              paddingHorizontal: 20,
            }}
            style={{ marginTop: topInset }}
          >
            <View className="mt-4">
              <RhfTextField label="Имя" name="name" placeholder="Введите имя" />
            </View>

            <View className="mt-4">
              <RhfTextField
                label="Телефон"
                name="phone"
                placeholder="+7 (___) ___-__-__"
                keyboardType="phone-pad"
              />
            </View>

            <View className="mt-4">
              <RhfTextField
                label="Комментарий"
                name="comment"
                placeholder="Заметка о клиенте..."
                multiline
              />
            </View>

            <View className="mt-8">
              <Button title="Создать клиента" onPress={handleSubmit(onSubmit)} />
            </View>
          </ScrollView>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default ClientCreate;
