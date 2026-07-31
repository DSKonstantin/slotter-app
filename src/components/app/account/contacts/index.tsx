import React, { useEffect } from "react";
import { Alert, Platform, RefreshControl, View } from "react-native";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  AccountLinksSchema,
  type AccountLinksFormValues,
} from "@/src/validation/schemas/accountLinks.schema";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Button, Divider, IconButton, StSvg } from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import { AddressField } from "@/src/components/shared/addressField";
import { colors } from "@/src/styles/colors";
import { BOTTOM_OFFSET_SMALL } from "@/src/constants/tabs";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import {
  useCreateUserLinkMutation,
  useDeleteUserLinkMutation,
  useGetUserLinksQuery,
  useUpdateUserLinkMutation,
} from "@/src/store/redux/services/api/userLinksApi";
import { useUpdateUserMutation } from "@/src/store/redux/services/api/usersApi";
import { useAppSelector } from "@/src/store/redux/store";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { skipToken } from "@reduxjs/toolkit/query";
import map from "lodash/map";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { useRefresh } from "@/src/hooks/useRefresh";
import ContactsSkeleton from "@/src/components/app/account/contacts/ContactsSkeleton";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import { router } from "expo-router";

const Contacts = () => {
  const auth = useRequiredAuth();
  const user = useAppSelector((s) => s.auth.user);

  const [updateUser] = useUpdateUserMutation();

  const {
    data: userLinks = [],
    isLoading,
    error,
    refetch,
  } = useGetUserLinksQuery(auth?.userId ?? skipToken);

  const [createUserLink, { isLoading: isCreating }] =
    useCreateUserLinkMutation();
  const [updateUserLink, { isLoading: isUpdating }] =
    useUpdateUserLinkMutation();

  const [deleteUserLink, { isLoading: isDeleting }] =
    useDeleteUserLinkMutation();

  const methods = useForm<AccountLinksFormValues>({
    resolver: yupResolver(AccountLinksSchema),
    defaultValues: {
      address: user?.address ?? "",
      hideAddress: false,
      links: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: methods.control,
    name: "links",
  });

  const watchedLinks = methods.watch("links") ?? [];
  const dirtyLinks = methods.formState.dirtyFields.links ?? [];

  useFormNavigationGuard(methods.formState.isDirty);

  const handleRefresh = async () => {
    try {
      await refetch();
    } catch {
      toast.error("Не удалось обновить ссылки");
    }
  };

  const { refreshing, onRefresh } = useRefresh(handleRefresh);

  const handleRemove = (index: number) => {
    if (!auth) return;

    const link = methods.getValues(`links.${index}`);

    if (!link) return;

    Alert.alert(
      "Удалить ссылку?",
      "Это действие нельзя отменить",
      [
        {
          text: "Отмена",
          style: "cancel",
        },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              if (link.id) {
                await deleteUserLink({
                  userId: auth.userId,
                  id: link.id,
                }).unwrap();
              }

              remove(index);
              methods.reset(methods.getValues());
            } catch (error) {
              toast.error(
                getApiErrorMessage(error, "Не удалось удалить ссылку"),
              );
            }
          },
        },
      ],
      { cancelable: true },
    );
  };

  const onSubmit = async (data: AccountLinksFormValues) => {
    if (!auth) return;

    try {
      await Promise.all([
        updateUser({
          id: auth.userId,
          data: { address: data.address },
        }).unwrap(),
        ...map(data.links, async (link, index) => {
          const isDirty = dirtyLinks[index];

          if (link.id && !isDirty) {
            return;
          }

          if (link.id) {
            return updateUserLink({
              userId: auth.userId,

              id: link.id,

              data: {
                name: link.title,
                link: link.url,
              },
            });
          }

          return createUserLink({
            userId: auth.userId,

            data: {
              name: link.title,
              link: link.url,
            },
          });
        }),
      ]);
      methods.reset(data);
      router.back();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить данные"));
    }
  };

  useEffect(() => {
    if (!userLinks.length) return;

    methods.reset({
      ...methods.getValues(),
      links: userLinks.map((link) => ({
        id: link.id,
        title: link.name,
        url: link.link,
      })),
    });
  }, [methods, userLinks]);

  if (!auth) return null;

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar title="Контакты">
        {({ topInset, bottomInset }) => {
          if (isLoading) {
            return <ContactsSkeleton topInset={topInset} />;
          }
          if (error) {
            return (
              <ErrorScreen
                topInset={topInset}
                title="Не удалось загрузить ссылки"
                onRetry={refetch}
              />
            );
          }
          return (
            <>
              <KeyboardAwareScrollView
                showsVerticalScrollIndicator={false}
                bottomOffset={BOTTOM_OFFSET_SMALL}
                contentInset={
                  Platform.OS === "ios" ? { top: topInset } : undefined
                }
                contentOffset={
                  Platform.OS === "ios" ? { x: 0, y: -topInset } : undefined
                }
                refreshControl={
                  <RefreshControl
                    progressViewOffset={Platform.select({ android: topInset })}
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                  />
                }
                contentContainerStyle={{
                  paddingTop: Platform.OS === "ios" ? 0 : topInset,
                  paddingBottom: 16,
                }}
              >
                <View className="px-screen gap-2">
                  <AddressField />

                  {fields.map((field, index) => (
                    <View key={field.id} className="gap-1">
                      <RhfTextField
                        label={`Ссылка №${index + 1}`}
                        name={`links.${index}.title`}
                        placeholder="Название ссылки"
                      />

                      <RhfTextField
                        name={`links.${index}.url`}
                        placeholder="https://вашассылка.com"
                        autoCapitalize="none"
                        keyboardType="url"
                        startAdornment={
                          <StSvg
                            name="glob_fill"
                            size={24}
                            color={colors.neutral[900]}
                          />
                        }
                        endAdornment={
                          watchedLinks[index]?.url ? (
                            <IconButton
                              size="xs"
                              disabled={isDeleting}
                              loading={isDeleting}
                              onPress={() => handleRemove(index)}
                              icon={
                                <StSvg
                                  name="close_ring_fill_light"
                                  size={24}
                                  color={colors.neutral[400]}
                                />
                              }
                            />
                          ) : null
                        }
                      />

                      <Divider />
                    </View>
                  ))}

                  <Button
                    variant="clear"
                    title={
                      fields.length === 0
                        ? "Добавить ссылку на соцсети или сайт"
                        : "Добавить новую ссылку"
                    }
                    onPress={() =>
                      append({
                        title: "",
                        url: "",
                      })
                    }
                    rightIcon={
                      <StSvg
                        name="Add_round_fill"
                        size={24}
                        color={colors.neutral[900]}
                      />
                    }
                  />
                </View>
              </KeyboardAwareScrollView>

              <View
                className="px-screen"
                style={{ paddingBottom: bottomInset + 8 }}
              >
                <Button
                  title="Сохранить изменения"
                  loading={isCreating || isUpdating}
                  disabled={isCreating || isUpdating}
                  onPress={methods.handleSubmit(onSubmit)}
                  rightIcon={
                    <StSvg
                      name="Save_fill"
                      size={24}
                      color={colors.neutral[0]}
                    />
                  }
                />
              </View>
            </>
          );
        }}
      </ScreenWithToolbar>
    </FormProvider>
  );
};

export default Contacts;
