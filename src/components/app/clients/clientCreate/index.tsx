import React, { useCallback, useState } from "react";
import { Alert, FlatList, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  ClientCreateSchema,
  type ClientCreateFormValues,
} from "@/src/validation/schemas/clientCreate.schema";
import { toast } from "@backpackapp-io/react-native-toast";

import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Badge, Button, StSvg, Typography } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { useContactsPermission } from "@/src/hooks/useContactsPermission";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import {
  useCreateCustomerMutation,
  useGetCustomerTagsQuery,
} from "@/src/store/redux/services/api/customersApi";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type { Customer } from "@/src/store/redux/services/api-types";
import { colors } from "@/src/styles/colors";
import ContactPickerModal, {
  type PickedContact,
} from "@/src/components/app/clients/clientCreate/contactPickerModal";
import CreateTagModal from "@/src/components/app/clients/clientCreate/createTagModal";
import { unMask } from "react-native-mask-text";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";

type ClientCreateProps = {
  onCreated?: (customer: Customer) => void;
};

const ClientCreate = ({ onCreated }: ClientCreateProps = {}) => {
  const auth = useRequiredAuth();
  const [pickerVisible, setPickerVisible] = useState(false);
  const [createTagVisible, setCreateTagVisible] = useState(false);

  const { data: tagsData } = useGetCustomerTagsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );
  const { isGranted, requestOrOpenSettings } = useContactsPermission();

  const methods = useForm({
    resolver: yupResolver(ClientCreateSchema),
    defaultValues: { name: "", phone: "", comment: "", customer_tag: null },
  });

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { isDirty },
  } = methods;
  useFormNavigationGuard(isDirty);
  const selectedTag = useWatch({ control, name: "customer_tag" }) ?? null;

  const [createCustomer, { isLoading }] = useCreateCustomerMutation();

  const onSubmit = useCallback(
    async (values: ClientCreateFormValues) => {
      try {
        const { customer } = await createCustomer({
          name: values.name.trim(),
          phone: `+${unMask(values?.phone ?? "")}`,
          note: values.comment?.trim() || undefined,
          customer_tag_id: values.customer_tag?.id ?? undefined,
        }).unwrap();
        onCreated?.(customer);
        reset();
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать клиента"));
      }
    },
    [createCustomer, onCreated, reset],
  );

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

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Новый клиент">
        {({ topInset, bottomInset }) => (
          <>
            <KeyboardAwareScrollView
              showsVerticalScrollIndicator={false}
              bottomOffset={BOTTOM_OFFSET}
              contentContainerStyle={{
                paddingBottom: 16,
                paddingHorizontal: 20,
              }}
              style={{ marginTop: topInset }}
            >
              <RhfTextField
                label="Имя"
                name="name"
                placeholder="Анна Петрова"
              />

              <View className="mt-1">
                <RhfTextField
                  label="Телефон"
                  name="phone"
                  maxLength={16}
                  hideErrorText
                  placeholder="+7 (___) ___-__-__"
                  keyboardType="phone-pad"
                  maskFn={maskPhone}
                />
              </View>

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

              <View className="mt-5">
                <Typography className="mb-2 font-inter-medium text-neutral-500 text-caption">
                  Категория
                </Typography>
                <FlatList
                  horizontal
                  data={tagsData?.customer_tags ?? []}
                  keyExtractor={(item) => String(item.id)}
                  showsHorizontalScrollIndicator={false}
                  className="mb-2"
                  contentContainerStyle={{ paddingRight: 8 }}
                  renderItem={({ item }) => (
                    <Badge
                      title={item.name}
                      variant={
                        selectedTag?.id === item.id ? "accent" : "secondary"
                      }
                      onPress={() =>
                        setValue(
                          "customer_tag",
                          selectedTag?.id === item.id ? null : item,
                        )
                      }
                      className="mr-2"
                    />
                  )}
                />
                <Button
                  title="Создать новую категорию"
                  variant="clear"
                  onPress={() => setCreateTagVisible(true)}
                  rightIcon={
                    <StSvg
                      name="Add_ring_fill_light"
                      size={18}
                      color={colors.neutral[900]}
                    />
                  }
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
            </KeyboardAwareScrollView>

            <View
              className="px-screen bg-background"
              style={{ paddingTop: 8, paddingBottom: bottomInset + 16 }}
            >
              <Button
                title="Создать клиента"
                rightIcon={
                  <StSvg name="Save_fill" size={24} color={colors.neutral[0]} />
                }
                onPress={handleSubmit(onSubmit)}
                loading={isLoading}
              />
            </View>

            <ContactPickerModal
              visible={pickerVisible}
              onClose={() => setPickerVisible(false)}
              onSelect={handleContactSelect}
            />

            <CreateTagModal
              visible={createTagVisible}
              userId={auth.userId}
              onClose={() => setCreateTagVisible(false)}
              onCreated={(tag) => setValue("customer_tag", tag)}
            />
          </>
        )}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default ClientCreate;
