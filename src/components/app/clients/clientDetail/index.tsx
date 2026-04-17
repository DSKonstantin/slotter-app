import React, { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
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
  useGetCustomerQuery,
  useUpdateCustomerMutation,
} from "@/src/store/redux/services/api/customersApi";

type Props = { customerId: number };

const ClientDetail = ({ customerId }: Props) => {
  const { data: customerData, isLoading: customerLoading } =
    useGetCustomerQuery({ customerId });

  const [updateCustomer, { isLoading: isSaving }] = useUpdateCustomerMutation();

  const customer = customerData?.customer;

  const [note, setNote] = useState(customer?.note ?? "");
  const isDirty = note !== (customer?.note ?? "");

  useEffect(() => {
    setNote(customer?.note ?? "");
  }, [customer?.note]);

  const handleSaveNote = async () => {
    if (!isDirty) return;
    await updateCustomer({ customerId, body: { note } });
  };

  if (customerLoading || !customer) {
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

  return (
    <ScreenWithToolbar title={customer.name}>
      {({ topInset, bottomInset }) => (
        <KeyboardAwareScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingTop: topInset,
            paddingBottom: bottomInset + 16,
            paddingHorizontal: 20,
          }}
        >
          <BirthdayBadge />

          <View className="gap-2 mt-2">
            <ClientInfoCard
              name={customer.name}
              phone={customer.phone || undefined}
              visitsCount={0}
              totalSpent="0 ₽"
              tag={customer.customer_tag ?? undefined}
            />

            <Card
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
                <StSvg name="Date_fill" size={26} color={colors.neutral[900]} />
              }
              onPress={() =>
                router.push(Routers.app.clients.history(customerId))
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
                <StSvg name="Edit_fill" size={26} color={colors.neutral[900]} />
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
            <Input
              multiline
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
              />
            )}
          </View>
        </KeyboardAwareScrollView>
      )}
    </ScreenWithToolbar>
  );
};

export default ClientDetail;
