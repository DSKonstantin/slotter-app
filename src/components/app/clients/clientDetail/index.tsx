import React, { useState, useCallback } from "react";
import { ActivityIndicator, View, RefreshControl } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "@backpackapp-io/react-native-toast";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import BirthdayBadge from "@/src/components/app/clients/shared/birthdayBadge";
import {
  Button,
  Card,
  Divider,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfTextField } from "@/src/components/hookForm/rhf-text-field";
import ClientInfoCard from "./clientInfoCard";
import { colors } from "@/src/styles/colors";
import HomeCard from "@/src/components/shared/cards/homeCard";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import {
  useGetUserCustomerQuery,
  useUpdateUserCustomerMutation,
} from "@/src/store/redux/services/api/userCustomersApi";
import { useCreateChatRoomMutation } from "@/src/store/redux/services/api/chatRoomsApi";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useFormNavigationGuard } from "@/src/hooks/useFormNavigationGuard";
import { useAppDispatch } from "@/src/store/redux/store";
import {
  clearSlotDraft,
  setSelectedCustomer,
} from "@/src/store/redux/slices/slotDraftSlice";
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { SCREEN_PADDING } from "@/src/constants/layout";
import { useRefresh } from "@/src/hooks/useRefresh";
import { getApiErrorMessage } from "@/src/utils/apiError";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import ChangeCategoryModal from "./changeCategoryModal";
import ContactsModal from "./contactsModal";
import ClientMenuModal from "./clientMenuModal";

type NoteFormValues = { note: string };

type Props = { userCustomerId?: number; customerId?: number };

const ClientDetail = ({ userCustomerId, customerId }: Props) => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const {
    data: customerData,
    isLoading: customerLoading,
    isError: customerError,
    refetch: refetchCustomer,
  } = useGetUserCustomerQuery(
    auth ? { userId: auth.userId, userCustomerId, customerId } : { userId: 0 },
    {
      skip: !auth || (userCustomerId === undefined && customerId === undefined),
    },
  );

  const [updateUserCustomer, { isLoading: isSaving }] =
    useUpdateUserCustomerMutation();
  const [createChatRoom] = useCreateChatRoomMutation();

  const userCustomer = customerData?.user_customer;
  const customer = userCustomer?.customer;
  const savedNote = userCustomer?.note ?? "";

  const { refreshing, onRefresh } = useRefresh(refetchCustomer);

  const methods = useForm<NoteFormValues>({
    defaultValues: { note: "" },
    values: { note: savedNote },
  });
  const {
    formState: { isDirty },
  } = methods;
  const { release } = useFormNavigationGuard(isDirty);

  const [changeCategoryVisible, setChangeCategoryVisible] = useState(false);
  const handleOpenChangeCategory = useCallback(
    () => setChangeCategoryVisible(true),
    [],
  );
  const handleCloseChangeCategory = useCallback(
    () => setChangeCategoryVisible(false),
    [],
  );

  const [contactsVisible, setContactsVisible] = useState(false);
  const handleOpenContacts = useCallback(() => setContactsVisible(true), []);
  const handleCloseContacts = useCallback(() => setContactsVisible(false), []);

  const [menuVisible, setMenuVisible] = useState(false);
  const handleOpenMenu = useCallback(() => setMenuVisible(true), []);
  const handleCloseMenu = useCallback(() => setMenuVisible(false), []);

  const handleSaveNote = methods.handleSubmit(async ({ note }) => {
    if (!auth || !userCustomer) return;
    try {
      await updateUserCustomer({
        userId: auth.userId,
        id: userCustomer.id,
        body: { note },
      }).unwrap();
      methods.reset({ note });
      toast.success("Заметка сохранена");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось сохранить заметку"));
    }
  });

  const handleBookAppointment = useCallback(() => {
    if (!customer) return;
    dispatch(clearSlotDraft());
    dispatch(setSelectedCustomer({ id: customer.id, name: customer.name }));
    release();
    router.push(Routers.app.calendar.slotSelectService());
  }, [customer, dispatch, release]);

  const handleOpenChat = async () => {
    if (!auth || !customer || !userCustomer) return;
    try {
      const room = await createChatRoom({
        userId: auth.userId,
        customerId: customer.id,
      }).unwrap();
      release();
      router.push(Routers.app.chat.room(room.id));
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Не удалось открыть чат"));
    }
  };

  if (customerLoading) {
    return (
      <ScreenWithToolbar title="Карточка клиента">
        {() => (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator />
          </View>
        )}
      </ScreenWithToolbar>
    );
  }

  if (customerError || !customer) {
    return (
      <ScreenWithToolbar title="Карточка клиента">
        {() => (
          <ErrorScreen
            title="Не удалось загрузить клиента"
            onRetry={refetchCustomer}
          />
        )}
      </ScreenWithToolbar>
    );
  }

  return (
    <FormProvider {...methods}>
      <ScreenWithToolbar
        title="Карточка клиента"
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Meatballs_menu"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={handleOpenMenu}
          />
        }
      >
        {({ topInset, bottomInset }) => (
          <KeyboardAwareScrollView
            showsVerticalScrollIndicator={false}
            bottomOffset={BOTTOM_OFFSET}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            contentContainerStyle={{
              paddingTop: topInset,
              paddingBottom: bottomInset + 16,
              paddingHorizontal: SCREEN_PADDING,
            }}
          >
            {customer.birthday && <BirthdayBadge />}

            <View className="gap-2 mt-2">
              <ClientInfoCard
                name={customer.name}
                phone={customer.phone || undefined}
                avatarUrl={customer.avatar_url ?? undefined}
                visitsCount={userCustomer?.stats.visits_count ?? 0}
                totalSpent={formatRublesFromCents(
                  userCustomer?.stats.total_spent_cents ?? 0,
                )}
                tag={userCustomer?.customer_tag ?? undefined}
              />

              <Card
                onPress={handleOpenChat}
                title="Написать"
                titleProps={{
                  style: {
                    color: colors.primary.blue[500],
                  },
                }}
                subtitle="Перейти в чат"
                left={
                  <View className="mb-[18px]">
                    <StSvg
                      name="Chat_plus_fill"
                      size={24}
                      color={colors.primary.blue[500]}
                    />
                  </View>
                }
                right={
                  <StSvg
                    name="Expand_right_light"
                    size={24}
                    color={colors.neutral[500]}
                  />
                }
              />
            </View>

            <Divider className="my-6" />

            <View className="flex-row gap-2 mb-2">
              <HomeCard
                className="bg-primary-blue-500"
                textClassName="text-white"
                title={"Записать\nклиента"}
                startAdornment={
                  <StSvg name="Edit_fill" size={26} color={colors.neutral[0]} />
                }
                onPress={handleBookAppointment}
              />
              <HomeCard
                title={"Связаться\n"}
                startAdornment={
                  <StSvg
                    name="Phone_fill"
                    size={26}
                    color={colors.neutral[900]}
                  />
                }
                onPress={handleOpenContacts}
              />
            </View>
            <View className="flex-row gap-2">
              <HomeCard
                title={"История\nпосещений"}
                startAdornment={
                  <StSvg
                    name="Date_fill"
                    size={26}
                    color={colors.neutral[900]}
                  />
                }
                onPress={() =>
                  userCustomer &&
                  router.push(Routers.app.clients.history(userCustomer.id))
                }
              />
              <HomeCard
                disabled
                title={"Сделать\nподарок"}
                startAdornment={
                  <StSvg
                    name="gift_alt_fill"
                    size={26}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>

            <Divider className="my-6" />

            <View className="gap-2">
              <Typography
                weight="medium"
                className="text-caption text-neutral-500"
              >
                Заметки
              </Typography>
              <RhfTextField
                name="note"
                multiline
                numberOfLines={4}
                placeholder="Добавить заметку о клиенте"
              />
              {isDirty && (
                <Button
                  title="Сохранить"
                  onPress={handleSaveNote}
                  loading={isSaving}
                  disabled={isSaving}
                  buttonClassName="w-full"
                  rightIcon={
                    <StSvg
                      name="Save_fill"
                      size={24}
                      color={colors.neutral[0]}
                    />
                  }
                />
              )}
            </View>
          </KeyboardAwareScrollView>
        )}
      </ScreenWithToolbar>

      {auth && userCustomer && (
        <ChangeCategoryModal
          visible={changeCategoryVisible}
          onClose={handleCloseChangeCategory}
          userId={auth.userId}
          userCustomerId={userCustomer.id}
          currentTag={userCustomer.customer_tag}
        />
      )}

      <ContactsModal
        visible={contactsVisible}
        onClose={handleCloseContacts}
        phone={customer.phone}
      />

      <ClientMenuModal
        visible={menuVisible}
        onClose={handleCloseMenu}
        onChangeCategory={handleOpenChangeCategory}
      />
    </FormProvider>
  );
};

export default ClientDetail;
