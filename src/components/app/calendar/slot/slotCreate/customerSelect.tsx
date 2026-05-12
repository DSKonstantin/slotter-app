import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, View } from "react-native";
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

type CustomerOption = AutocompleteItem & { avatarUrl?: string | null };

const CustomerSelect = () => {
  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const createdCustomer = useAppSelector((s) => s.slotDraft.createdCustomer);
  const selectedCustomerFromDraft = useAppSelector(
    (s) => s.slotDraft.selectedCustomer,
  );
  const { setValue } = useFormContext();

  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);

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

  return (
    <>
      <View className="mt-5 gap-2">
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
        <Button
          title=" Создать нового клиента"
          variant="clear"
          onPress={() => router.push(Routers.app.calendar.slotClientCreate)}
          rightIcon={
            <StSvg
              name="Add_round_fill"
              size={24}
              color={colors.neutral[900]}
            />
          }
        />
      </View>

      <StModal visible={modalVisible} onClose={handleClose} keyboardAware>
        <Typography weight="semibold" className="text-display text-center mb-4">
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
        <View>
          {isCustomersLoading ? (
            <View className="items-center py-6">
              <ActivityIndicator color={colors.neutral[400]} />
            </View>
          ) : isCustomersError ? (
            <View className="py-4">
              <RetryInline
                text="Не удалось загрузить клиентов"
                onRetry={refetchCustomers}
              />
            </View>
          ) : filteredCustomers.length === 0 ? (
            <View className="flex-1 items-center justify-center gap-2 mt-2 mb-4">
              <StSvg name="Chat_search" size={32} color={colors.neutral[400]} />
              <Typography className="text-body text-neutral-500 text-center">
                И близко ничего не нашли
              </Typography>
            </View>
          ) : (
            filteredCustomers.map((item, index) => (
              <View key={item.id}>
                {index > 0 && <View className="h-px bg-neutral-100" />}
                <Pressable
                  className="flex-row items-center gap-3 py-3 px-2 active:opacity-70"
                  onPress={() => handleSelect(item)}
                >
                  <Avatar
                    uri={item.avatarUrl ?? undefined}
                    name={item.title}
                    size="sm"
                  />
                  <Typography className="text-body text-neutral-900">
                    {item.title}
                  </Typography>
                </Pressable>
              </View>
            ))
          )}
        </View>
      </StModal>
    </>
  );
};

export default CustomerSelect;
