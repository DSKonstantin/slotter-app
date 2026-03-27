import React, { useCallback, useState } from "react";
import { Alert, ScrollView, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { TAB_BAR_HEIGHT } from "@/src/constants/tabs";
import { useContactsPermission } from "@/src/hooks/useContactsPermission";
import { colors } from "@/src/styles/colors";
import ContactPickerModal, {
  type PickedContact,
} from "@/src/components/app/clients/clientCreate/contactPickerModal";

const ClientCreateSchema = Yup.object({
  name: Yup.string().required("Укажите имя"),
  phone: Yup.string(),
  comment: Yup.string(),
});

type ClientCreateFormValues = Yup.InferType<typeof ClientCreateSchema>;

const ClientCreate = () => {
  const { bottom } = useSafeAreaInsets();
  const [pickerVisible, setPickerVisible] = useState(false);
  const { isGranted, requestOrOpenSettings } = useContactsPermission();

  const methods = useForm({
    resolver: yupResolver(ClientCreateSchema),
    defaultValues: { name: "", phone: "", comment: "" },
  });

  const { handleSubmit, setValue } = methods;

  const onSubmit = useCallback(async (_values: ClientCreateFormValues) => {
    try {
      // TODO: connect real API
      toast.success("Клиент создан");
      router.back();
    } catch {
      toast.error("Не удалось создать клиента");
    }
  }, []);

  const handleContactsPress = useCallback(async () => {
    if (isGranted) {
      setPickerVisible(true);
      return;
    }

    const result = await requestOrOpenSettings();

    if (result.status === "granted") {
      setPickerVisible(true);
    } else if (!result.canAskAgain) {
      Alert.alert(
        "Нет доступа к контактам",
        "Разрешите доступ к контактам в настройках телефона",
        [{ text: "ОК", style: "default" }],
      );
    }
  }, [isGranted, requestOrOpenSettings]);

  const handleContactSelect = useCallback(
    ({ name, phone }: PickedContact) => {
      setValue("name", name, { shouldValidate: true });
      setValue("phone", phone, { shouldValidate: true });
    },
    [setValue],
  );

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Новый клиент">
        {({ topInset }) => (
          <>
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
                <Button
                  title="Выбрать из контактов"
                  variant="secondary"
                  onPress={handleContactsPress}
                  leftIcon={
                    <StSvg
                      name="User_fill"
                      size={20}
                      color={colors.neutral[900]}
                    />
                  }
                />
              </View>

              <View className="mt-4">
                <RhfTextField
                  label="Имя"
                  name="name"
                  placeholder="Введите имя"
                />
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
                <Button
                  title="Создать клиента"
                  onPress={handleSubmit(onSubmit)}
                />
              </View>
            </ScrollView>

            <ContactPickerModal
              visible={pickerVisible}
              onClose={() => setPickerVisible(false)}
              onSelect={handleContactSelect}
            />
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default ClientCreate;
