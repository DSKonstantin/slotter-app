import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Alert, FlatList, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { skipToken } from "@reduxjs/toolkit/query";
import { router } from "expo-router";
import { maskPhone } from "@/src/utils/mask/maskPhone";
import { useForm, useWatch } from "react-hook-form";
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
import { useGetCustomerTagsQuery } from "@/src/store/redux/services/api/customersApi";
import { useCreateUserCustomerMutation } from "@/src/store/redux/services/api/userCustomersApi";
import { useAppDispatch } from "@/src/store/redux/store";
import { setTagId } from "@/src/store/redux/slices/clientsSlice";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type {
  CustomerTag,
  UserCustomer,
} from "@/src/store/redux/services/api-types";
import { colors } from "@/src/styles/colors";
import ContactPickerModal, {
  type PickedContact,
} from "@/src/components/app/clients/clientCreate/contactPickerModal";
import CreateTagModal from "@/src/components/app/clients/clientCreate/createTagModal";
import { unMask } from "react-native-mask-text";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { RhfFormProvider } from "@/src/components/hookForm/rhf-form-provider";

type ClientCreateProps = {
  onCreated?: (userCustomer: UserCustomer) => void;
};

const ClientCreate = ({ onCreated }: ClientCreateProps = {}) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [createTagVisible, setCreateTagVisible] = useState(false);

  const tagsListRef = useRef<FlatList<CustomerTag>>(null);
  const scrollFallbackTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );

  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();

  const { data: tagsData } = useGetCustomerTagsQuery(
    auth ? { userId: auth.userId } : skipToken,
  );

  const [createUserCustomer, { isLoading }] = useCreateUserCustomerMutation();

  const { isGranted, requestOrOpenSettings } = useContactsPermission();

  const methods = useForm({
    resolver: yupResolver(ClientCreateSchema),
    defaultValues: { name: "", phone: "", comment: "", customer_tag: null },
  });

  const {
    handleSubmit,
    setValue,
    control,
    formState: { isDirty },
  } = methods;
  useFormNavigationGuard(isDirty);
  const selectedTag = useWatch({ control, name: "customer_tag" }) ?? null;

  const tags = useMemo(
    () => tagsData?.customer_tags ?? [],
    [tagsData?.customer_tags],
  );

  const onSubmit = useCallback(
    async (values: ClientCreateFormValues) => {
      if (!auth) return;
      try {
        const { user_customer } = await createUserCustomer({
          userId: auth.userId,
          body: {
            customer: {
              name: values.name.trim() || undefined,
              phone: `+${unMask(values?.phone ?? "")}`,
            },
            customer_tag_id: values.customer_tag?.id ?? undefined,
            note: values.comment?.trim() || undefined,
          },
        }).unwrap();
        onCreated?.(user_customer);
        dispatch(setTagId(undefined));
        methods.reset();
        router.back();
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать клиента"));
      }
    },
    [auth, createUserCustomer, onCreated, methods, dispatch],
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
      setValue("phone", maskPhone(phone), { shouldValidate: true });
    },
    [setValue],
  );

  useEffect(() => {
    if (!selectedTag?.id || tags.length === 0) return;
    const selectedIndex = tags.findIndex((tag) => tag.id === selectedTag.id);
    if (selectedIndex < 0) return;
    const timeoutId = setTimeout(() => {
      tagsListRef.current?.scrollToIndex({
        index: selectedIndex,
        animated: true,
        viewPosition: 0.5,
      });
    }, 0);
    return () => clearTimeout(timeoutId);
  }, [tags, selectedTag?.id]);

  useEffect(() => {
    const ref = scrollFallbackTimeoutRef;
    return () => {
      if (ref.current) clearTimeout(ref.current);
    };
  }, []);

  if (!auth) return null;

  return (
    <RhfFormProvider methods={methods} offset={0}>
      {({ setScrollRef, contentRef, scrollToError }) => (
        <>
          <ScreenWithToolbar title="Новый клиент">
            {({ topInset, bottomInset }) => (
              <>
                <KeyboardAwareScrollView
                  ref={setScrollRef}
                  showsVerticalScrollIndicator={false}
                  bottomOffset={BOTTOM_OFFSET}
                  contentContainerStyle={{
                    paddingBottom: 16,
                  }}
                  style={{ marginTop: topInset }}
                >
                  <View ref={contentRef} collapsable={false}>
                    <View className="px-screen">
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
                    </View>

                    <View className="mt-5">
                      <Typography className="px-screen mb-2 font-inter-medium text-neutral-500 text-caption">
                        Категория
                      </Typography>
                      <FlatList
                        ref={tagsListRef}
                        horizontal
                        data={tags}
                        keyExtractor={(item) => String(item.id)}
                        showsHorizontalScrollIndicator={false}
                        className="mb-2"
                        contentContainerStyle={{
                          paddingRight: 8,
                          paddingHorizontal: SCREEN_PADDING,
                        }}
                        onScrollToIndexFailed={({
                          index,
                          averageItemLength,
                        }) => {
                          tagsListRef.current?.scrollToOffset({
                            offset: Math.max(0, index * averageItemLength),
                            animated: true,
                          });
                          scrollFallbackTimeoutRef.current = setTimeout(() => {
                            tagsListRef.current?.scrollToIndex({
                              index,
                              animated: true,
                              viewPosition: 0.5,
                            });
                          }, 100);
                        }}
                        renderItem={({ item }) => (
                          <Badge
                            title={item.name}
                            variant={
                              selectedTag?.id === item.id
                                ? "accent"
                                : "secondary"
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
                        buttonClassName="mx-screen"
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

                    <View className="mt-4 px-screen">
                      <RhfTextField
                        label="Комментарий"
                        name="comment"
                        placeholder="Заметка о клиенте..."
                        multiline
                      />
                    </View>
                  </View>
                </KeyboardAwareScrollView>

                <View
                  className="px-screen bg-background"
                  style={{ paddingTop: 8, paddingBottom: bottomInset + 8 }}
                >
                  <Button
                    title="Создать клиента"
                    rightIcon={
                      <StSvg
                        name="Save_fill"
                        size={24}
                        color={colors.neutral[0]}
                      />
                    }
                    onPress={handleSubmit(onSubmit, scrollToError)}
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
        </>
      )}
    </RhfFormProvider>
  );
};

export default ClientCreate;
