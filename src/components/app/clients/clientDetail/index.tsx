import React, { useEffect, useState, useCallback } from "react";
import { ActivityIndicator, View, RefreshControl } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { ErrorScreen } from "@/src/components/shared/emptyStateScreen";
import BirthdayBadge from "@/src/components/app/clients/shared/birthdayBadge";
import {
  Button,
  Card,
  Divider,
  Input,
  StSvg,
  Typography,
} from "@/src/components/ui";
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
import { BOTTOM_OFFSET } from "@/src/constants/tabs";
import { useRefresh } from "@/src/hooks/useRefresh";
import { formatRublesFromCents } from "@/src/utils/price/formatPrice";
import ChangeCategoryModal from "./changeCategoryModal";

type Props = { userCustomerId?: number; customerId?: number };

const ClientDetail = ({ userCustomerId, customerId }: Props) => {
  const auth = useRequiredAuth();
  const {
    data: customerData,
    isLoading: customerLoading,
    isError: customerError,
    refetch: refetchCustomer,
  } = useGetUserCustomerQuery(
    auth
      ? { userId: auth.userId, userCustomerId, customerId }
      : { userId: 0 },
    {
      skip: !auth || (userCustomerId === undefined && customerId === undefined),
      refetchOnMountOrArgChange: true,
    },
  );

  const [updateUserCustomer, { isLoading: isSaving }] =
    useUpdateUserCustomerMutation();
  const [createChatRoom] = useCreateChatRoomMutation();

  const userCustomer = customerData?.user_customer;
  const customer = userCustomer?.customer;
  const note0 = userCustomer?.note ?? "";

  const { refreshing, onRefresh } = useRefresh(refetchCustomer);

  const [note, setNote] = useState(note0);
  const isDirty = note !== note0;
  const [changeCategoryVisible, setChangeCategoryVisible] = useState(false);
  const handleOpenChangeCategory = useCallback(
    () => setChangeCategoryVisible(true),
    [],
  );
  const handleCloseChangeCategory = useCallback(
    () => setChangeCategoryVisible(false),
    [],
  );

  const handleSaveNote = async () => {
    if (!isDirty || !auth || !userCustomer) return;
    await updateUserCustomer({
      userId: auth.userId,
      id: userCustomer.id,
      body: { note },
    });
  };

  const handleOpenChat = async () => {
    if (!auth || !customer || !userCustomer) return;
    try {
      const room = await createChatRoom({
        userId: auth.userId,
        customerId: customer.id,
      }).unwrap();
      const chatRoute = Routers.app.chat.room(room.id);
      const clientRoute = Routers.app.clients.detail(userCustomer.id);
      router.push({
        pathname: chatRoute.pathname,
        params: {
          ...chatRoute.params,
          backTo: clientRoute.pathname.replace("[id]", String(userCustomer.id)),
        },
      });
    } catch {}
  };

  useEffect(() => {
    setNote(note0);
  }, [note0]);

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
    <>
      <ScreenWithToolbar title="Карточка клиента">
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
              paddingHorizontal: 20,
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
                title={"Доход\nпо клиенту"}
                startAdornment={
                  <StSvg
                    name="Wallet_fill"
                    size={26}
                    color={colors.neutral[900]}
                  />
                }
              />
            </View>

            <View className="flex-row gap-2">
              <HomeCard
                title={"Изменить\nкатегорию"}
                startAdornment={
                  <StSvg
                    name="Edit_fill"
                    size={26}
                    color={colors.neutral[900]}
                  />
                }
                onPress={handleOpenChangeCategory}
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
              <Input
                multiline
                numberOfLines={4}
                placeholder="Добавить заметку о клиенте"
                value={note}
                onChangeText={setNote}
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
    </>
  );
};

export default ClientDetail;
