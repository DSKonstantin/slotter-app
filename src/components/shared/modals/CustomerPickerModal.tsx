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
import { router } from "expo-router";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { skipToken } from "@reduxjs/toolkit/query";

import {
  Avatar,
  HighlightText,
  IconButton,
  Input,
  StModal,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { Routers } from "@/src/constants/routers";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { clearCreatedCustomer } from "@/src/store/redux/slices/slotDraftSlice";
import { useGetUserCustomersPaginatedInfiniteQuery } from "@/src/store/redux/services/api/userCustomersApi";
import RetryInline from "@/src/components/shared/retryInline";
import { SCREEN_PADDING } from "@/src/constants/layout";
import type { UserCustomer } from "@/src/store/redux/services/api-types";

export type CustomerOption = {
  id: number;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  avatarBlurhash?: string | null;
};

const LIST_MAX_HEIGHT = 400;
const LIST_MIN_HEIGHT = 200;
const SEARCH_DEBOUNCE_MS = 300;

function toOption(uc: UserCustomer): CustomerOption {
  return {
    id: uc.customer.id,
    name: uc.customer.name,
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
        name={item.name}
        size="sm"
      />
      <View className="flex-1">
        <HighlightText
          text={item.name}
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

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelect: (customer: CustomerOption) => void;
  selectedCustomer?: CustomerOption | null;
  onRemove?: () => void;
}

const CustomerPickerModal = ({
  visible,
  onClose,
  onSelect,
  selectedCustomer,
  onRemove,
}: Props) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const debouncedSetSearch = useRef(
    debounce((value: string) => setDebouncedSearch(value), SEARCH_DEBOUNCE_MS),
  ).current;

  const auth = useRequiredAuth();
  const dispatch = useAppDispatch();
  const createdCustomer = useAppSelector((s) => s.slotDraft.createdCustomer);
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();

  const {
    data,
    isLoading,
    isFetchingNextPage,
    isFetching,
    isError,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useGetUserCustomersPaginatedInfiniteQuery(
    auth && visible
      ? { userId: auth.userId, query: debouncedSearch || undefined }
      : skipToken,
  );

  const listHeight = Math.max(
    LIST_MIN_HEIGHT,
    Math.min((height - top - bottom - keyboardHeight) * 0.5, LIST_MAX_HEIGHT),
  );

  const customerItems = useMemo<CustomerOption[]>(() => {
    if (!data?.pages) return [];
    const unique = new Map<number, CustomerOption>();
    data.pages.forEach((page) =>
      page.user_customers.forEach((uc) => {
        if (!unique.has(uc.customer.id))
          unique.set(uc.customer.id, toOption(uc));
      }),
    );
    if (selectedCustomer) unique.delete(selectedCustomer.id);
    return [...unique.values()];
  }, [data?.pages, selectedCustomer]);

  const handleClose = useCallback(() => {
    onClose();
    setSearch("");
    debouncedSetSearch.cancel();
    setDebouncedSearch("");
    setKeyboardHeight(0);
  }, [onClose, debouncedSetSearch]);

  const handleSelect = useCallback(
    (item: CustomerOption) => {
      onSelect(item);
      handleClose();
    },
    [onSelect, handleClose],
  );

  const handleCreateNew = useCallback(() => {
    const name = search.trim();
    handleClose();
    router.push(Routers.app.createClient(name ? { name } : undefined));
  }, [search, handleClose]);

  const handleRemove = useCallback(() => {
    onRemove?.();
  }, [onRemove]);

  useEffect(() => {
    if (!createdCustomer) return;
    handleSelect({ id: createdCustomer.id, name: createdCustomer.name });
    dispatch(clearCreatedCustomer());
  }, [createdCustomer, handleSelect, dispatch]);

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
    <StModal
      header={
        <View className="px-screen gap-4">
          <Typography weight="semibold" className="text-display text-center">
            Выбрать клиента
          </Typography>
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
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
                  (!!debouncedSearch && isFetching) ? (
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
            <IconButton
              onPress={handleCreateNew}
              icon={
                <StSvg name="Add_round" size={24} color={colors.neutral[900]} />
              }
            />
          </View>
        </View>
      }
      horizontalPadding={false}
      visible={visible}
      onClose={handleClose}
    >
      <View style={{ paddingBottom: keyboardHeight }}>
        {selectedCustomer && onRemove && (
          <View className="px-screen">
            <View className="flex-row items-center gap-3 py-3 px-2">
              <Avatar
                uri={selectedCustomer.avatarUrl ?? undefined}
                blurhash={selectedCustomer.avatarBlurhash}
                name={selectedCustomer.name}
                size="sm"
              />
              <View className="flex-1">
                <Typography
                  numberOfLines={2}
                  className="font-inter-medium text-body text-neutral-900"
                >
                  {selectedCustomer.name}
                </Typography>
                {selectedCustomer.phone && (
                  <Typography className="font-inter-regular text-caption text-neutral-500">
                    {selectedCustomer.phone}
                  </Typography>
                )}
              </View>
              <IconButton
                size="sm"
                buttonClassName="bg-transparent"
                onPress={handleRemove}
                icon={
                  <StSvg
                    name="Close_round_fill_light"
                    size={24}
                    color={colors.neutral[500]}
                  />
                }
              />
            </View>
            <View className="h-px bg-neutral-100" />
          </View>
        )}
        {isLoading ? (
          <View
            className="items-center justify-center"
            style={{ height: LIST_MIN_HEIGHT }}
          >
            <ActivityIndicator color={colors.neutral[400]} />
          </View>
        ) : isError ? (
          <View
            className="px-screen justify-center"
            style={{ height: LIST_MIN_HEIGHT }}
          >
            <RetryInline
              text="Не удалось загрузить клиентов"
              onRetry={refetch}
            />
          </View>
        ) : (
          <View style={{ height: listHeight }}>
            <FlashList
              data={customerItems}
              keyExtractor={(item) => String(item.id)}
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
  );
};

export default CustomerPickerModal;
