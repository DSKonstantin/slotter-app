import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
  useWindowDimensions,
} from "react-native";
import debounce from "lodash/debounce";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import { useFormContext } from "react-hook-form";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  Avatar,
  Button,
  HighlightText,
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
import { useGetUserCustomersPaginatedInfiniteQuery } from "@/src/store/redux/services/api/userCustomersApi";
import RetryInline from "@/src/components/shared/retryInline";
import type { AutocompleteItem } from "@/src/components/ui/fields/Autocomplete";
import { SCREEN_PADDING } from "@/src/constants/layout";
import type { UserCustomer } from "@/src/store/redux/services/api-types";

type CustomerOption = AutocompleteItem & {
  avatarUrl?: string | null;
  avatarBlurhash?: string | null;
  phone?: string | null;
};

const LIST_MAX_HEIGHT = 400;
const LIST_MIN_HEIGHT = 200;
const SEARCH_DEBOUNCE_MS = 300;

function toOption(uc: UserCustomer): CustomerOption {
  return {
    id: String(uc.customer.id),
    title: uc.customer.name,
    avatarUrl: uc.customer.avatar_url,
    avatarBlurhash: uc.customer.avatar_blurhash,
    phone: uc.customer.phone,
  };
}

const CustomerRow = memo(
  ({
    item,
    highlight,
    onPress,
  }: {
    item: CustomerOption;
    highlight?: string;
    onPress: (item: CustomerOption) => void;
  }) => (
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
      <View className="flex-1">
        <HighlightText
          text={item.title}
          numberOfLines={2}
          highlight={highlight ?? ""}
          className="font-inter-medium text-body text-neutral-900"
        />
        {item.phone && (
          <HighlightText
            text={item.phone}
            highlight={highlight ?? ""}
            className="font-inter-regular text-caption text-neutral-500"
          />
        )}
      </View>
    </Pressable>
  ),
);
CustomerRow.displayName = "CustomerRow";

const Separator = () => <View className="mx-2 h-px bg-neutral-100" />;

type Props = {
  showCreateButton?: boolean;
};

const CustomerSelectField = ({ showCreateButton = true }: Props) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerOption | null>(null);

  const debouncedSetSearch = useRef(
    debounce((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS),
  ).current;

  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const createdCustomer = useAppSelector((s) => s.slotDraft.createdCustomer);
  const selectedCustomerFromDraft = useAppSelector(
    (s) => s.slotDraft.selectedCustomer,
  );
  const { setValue } = useFormContext();
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();

  const {
    data,
    isLoading: isCustomersLoading,
    isFetchingNextPage,
    isFetching: isCustomersFetching,
    isError: isCustomersError,
    hasNextPage,
    fetchNextPage,
    refetch: refetchCustomers,
  } = useGetUserCustomersPaginatedInfiniteQuery(
    auth
      ? { userId: auth.userId, query: debouncedSearch || undefined }
      : skipToken,
  );

  const listHeight = Math.max(
    LIST_MIN_HEIGHT,
    Math.min((height - top - bottom - keyboardHeight) * 0.5, LIST_MAX_HEIGHT),
  );

  const customerItems = useMemo<CustomerOption[]>(() => {
    if (!data?.pages) return [];
    const unique = new Map<string, CustomerOption>();
    data.pages.forEach((page) =>
      page.user_customers.forEach((uc) => {
        const id = String(uc.customer.id);
        if (!unique.has(id)) unique.set(id, toOption(uc));
      }),
    );
    return [...unique.values()];
  }, [data?.pages]);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    setSearch("");
    debouncedSetSearch.cancel();
    setDebouncedSearch("");
    setKeyboardHeight(0);
  }, [debouncedSetSearch]);

  const handleSelect = useCallback(
    (item: CustomerOption) => {
      setSelectedCustomer(item);
      setValue("customerId", parseInt(item.id, 10) || 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setModalVisible(false);
      setSearch("");
      debouncedSetSearch.cancel();
      setDebouncedSearch("");
    },
    [setValue, debouncedSetSearch],
  );

  const handleEndReached = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const renderItem = useCallback<ListRenderItem<CustomerOption>>(
    ({ item }) => (
      <CustomerRow item={item} highlight={search} onPress={handleSelect} />
    ),
    [handleSelect, search],
  );

  useEffect(() => {
    const source = createdCustomer ?? selectedCustomerFromDraft;
    if (!source) return;
    const item: CustomerOption = { id: String(source.id), title: source.name };
    setValue("customerId", parseInt(item.id, 10) || 0, {
      shouldDirty: true,
      shouldValidate: true,
    });
    setSelectedCustomer(item);
    if (createdCustomer) dispatch(clearCreatedCustomer());
    else dispatch(clearSelectedCustomer());
  }, [createdCustomer, selectedCustomerFromDraft, dispatch, setValue]);

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
              onChangeText={(value) => {
                setSearch(value);
                debouncedSetSearch(value);
              }}
              placeholder="Поиск по имени или телефону"
              hideErrorText
              startAdornment={
                <StSvg name="Search" size={24} color={colors.neutral[500]} />
              }
              endAdornment={
                search !== debouncedSearch ||
                (!!debouncedSearch && isCustomersFetching) ? (
                  <ActivityIndicator color={colors.neutral[400]} />
                ) : search.length > 0 ? (
                  <Pressable
                    className="active:opacity-70"
                    onPress={() => {
                      setSearch("");
                      debouncedSetSearch.cancel();
                      setDebouncedSearch("");
                    }}
                  >
                    <StSvg
                      name="close_ring_fill_light"
                      size={20}
                      color={colors.neutral[400]}
                    />
                  </Pressable>
                ) : undefined
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
                data={customerItems}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{
                  paddingHorizontal: SCREEN_PADDING,
                  flexGrow: 1,
                }}
                ItemSeparatorComponent={Separator}
                keyboardShouldPersistTaps="handled"
                onEndReached={handleEndReached}
                onEndReachedThreshold={0.5}
                ListFooterComponent={
                  isFetchingNextPage ? (
                    <ActivityIndicator
                      size="small"
                      color={colors.neutral[400]}
                      style={{ paddingVertical: 12 }}
                    />
                  ) : null
                }
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

export default CustomerSelectField;
