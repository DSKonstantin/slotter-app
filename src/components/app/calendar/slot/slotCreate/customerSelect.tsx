import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import { useFormContext } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  Avatar,
  Button,
  Input,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { RhfPressableField } from "@/src/components/hookForm/rhf-pressable-field";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import {
  clearCreatedCustomer,
  clearSelectedCustomer,
} from "@/src/store/redux/slices/slotDraftSlice";
import { useGetUserCustomersQuery } from "@/src/store/redux/services/api/userCustomersApi";
import RetryInline from "@/src/components/shared/retryInline";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";
import { SCREEN_PADDING } from "@/src/constants/layout";

type CustomerOption = AutocompleteItem & {
  avatarUrl?: string | null;
  avatarBlurhash?: string | null;
};

const LIST_MAX_HEIGHT = 400;
const LIST_MIN_HEIGHT = 200;

const CustomerRow = React.memo(function CustomerRow({
  item,
  onPress,
}: {
  item: CustomerOption;
  onPress: (item: CustomerOption) => void;
}) {
  return (
    <Pressable
      className="flex-row items-center gap-3 py-3 px-2 active:opacity-70"
      onPress={() => onPress(item)}
    >
      <Avatar
        uri={item.avatarUrl ?? undefined}
        blurhash={item.avatarBlurhash}
        name={item.title}
        size="sm"
      />
      <Typography className="text-body text-neutral-900">
        {item.title}
      </Typography>
    </Pressable>
  );
});

const Separator = () => <View className="mx-2 h-px bg-neutral-100" />;

type Props = {
  showCreateButton?: boolean;
};

const CustomerSelect = ({ showCreateButton = true }: Props) => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const createdCustomer = useAppSelector((s) => s.slotDraft.createdCustomer);
  const selectedCustomerFromDraft = useAppSelector(
    (s) => s.slotDraft.selectedCustomer,
  );
  const { setValue } = useFormContext();
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);

  const available = height - top - bottom - keyboardHeight;
  const listHeight = Math.max(
    LIST_MIN_HEIGHT,
    Math.min(available * 0.5, LIST_MAX_HEIGHT),
  );

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    refetch: refetchCustomers,
  } = useGetUserCustomersQuery(auth ? { userId: auth.userId } : skipToken);

  const customerItems = useMemo<CustomerOption[]>(
    () =>
      (customersData?.user_customers ?? []).map((uc) => ({
        id: String(uc.customer.id),
        title: uc.customer.name,
        avatarUrl: uc.customer.avatar_url,
        avatarBlurhash: uc.customer.avatar_blurhash,
      })),
    [customersData],
  );

  const filteredCustomers = useMemo(
    () =>
      customerItems.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase()),
      ),
    [customerItems, search],
  );

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setSearch("");
    setKeyboardHeight(0);
  }, []);

  const handleSelect = useCallback(
    (item: CustomerOption) => {
      setSelectedCustomer(item);
      setValue("customerId", parseInt(item.id, 10) || 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setModalVisible(false);
      setSearch("");
    },
    [setValue],
  );

  const renderItem = useCallback<ListRenderItem<CustomerOption>>(
    ({ item }) => <CustomerRow item={item} onPress={handleSelect} />,
    [handleSelect],
  );

  useEffect(() => {
    if (!createdCustomer) return;
    const item: CustomerOption = {
      id: String(createdCustomer.id),
      title: createdCustomer.name,
    };
    setValue("customerId", parseInt(item.id, 10) || 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedCustomer(item);
    dispatch(clearCreatedCustomer());
  }, [createdCustomer, dispatch, setValue]);

  useEffect(() => {
    if (!selectedCustomerFromDraft) return;
    const item: CustomerOption = {
      id: String(selectedCustomerFromDraft.id),
      title: selectedCustomerFromDraft.name,
    };
    setValue("customerId", parseInt(item.id, 10) || 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedCustomer(item);
    dispatch(clearSelectedCustomer());
  }, [selectedCustomerFromDraft, dispatch, setValue]);

  useEffect(() => {
    const show = KeyboardEvents.addListener("keyboardWillShow", (e) =>
      setKeyboardHeight(e.height),
    );
    const hide = KeyboardEvents.addListener("keyboardWillHide", () =>
      setKeyboardHeight(0),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  return (
    <>
      <View className="gap-2">
        <RhfPressableField
          name="customerId"
          label="Клиент"
          hideErrorText
          startAdornment={
            <StSvg name="Search" size={24} color={colors.neutral[900]} />
          }
          displayValue={selectedCustomer?.title}
          placeholder="Поиск по имени или телефону"
          onPress={() => setModalVisible(true)}
        />
        {showCreateButton && (
          <Button
            title=" Создать нового клиента"
            variant="clear"
            onPress={() => router.push(Routers.app.createClient)}
            rightIcon={
              <StSvg
                name="Add_round_fill"
                size={24}
                color={colors.neutral[900]}
              />
            }
          />
        )}
      </View>

      <StModal
        header={
          <View className="px-screen gap-4">
            <Typography weight="semibold" className="text-display text-center">
              Выбрать клиента
            </Typography>
            <Input
              value={search}
              onChangeText={setSearch}
              placeholder="Поиск по имени или телефону"
              hideErrorText
              startAdornment={
                <StSvg name="Search" size={24} color={colors.neutral[500]} />
              }
            />
          </View>
        }
        horizontalPadding={false}
        visible={modalVisible}
        onClose={handleClose}
      >
        <View style={{ paddingBottom: keyboardHeight }}>
          {isCustomersLoading ? (
            <View
              className="items-center justify-center"
              style={{ height: LIST_MIN_HEIGHT }}
            >
              <ActivityIndicator color={colors.neutral[400]} />
            </View>
          ) : isCustomersError ? (
            <View
              className="px-screen justify-center"
              style={{ height: LIST_MIN_HEIGHT }}
            >
              <RetryInline
                text="Не удалось загрузить клиентов"
                onRetry={refetchCustomers}
              />
            </View>
          ) : (
            <View style={{ height: listHeight }}>
              <FlashList
                data={filteredCustomers}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{
                  paddingHorizontal: SCREEN_PADDING,
                }}
                ItemSeparatorComponent={Separator}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <View className="flex-1 items-center justify-center gap-2">
                    <StSvg
                      name="Chat_search"
                      size={32}
                      color={colors.neutral[400]}
                    />
                    <Typography className="text-body text-neutral-500 text-center">
                      И близко ничего не нашли
                    </Typography>
                  </View>
                }
              />
            </View>
          )}
        </View>
      </StModal>
    </>
  );
};

export default CustomerSelect;
