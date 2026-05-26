import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { KeyboardEvents } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList, type ListRenderItem } from "@shopify/flash-list";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { StModal } from "@/src/components/ui/StModal";
import { Avatar, HighlightText, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetUserCustomersQuery } from "@/src/store/redux/services/api/userCustomersApi";
import RetryInline from "@/src/components/shared/retryInline";
import {
  useCreateChatRoomMutation,
  useGetChatRoomsInfiniteQuery,
} from "@/src/store/redux/services/api/chatRoomsApi";
import { Routers } from "@/src/constants/routers";
import type { ChatRoom } from "@/src/store/redux/services/api-types";

type RowItem = {
  id: number;
  name: string;
  phone: string;
  existingRoom: ChatRoom | null;
};

type Props = {
  visible: boolean;
  onClose: () => void;
};

const CustomerRow = React.memo(function CustomerRow({
  item,
  highlight,
  isCreating,
  anyCreating,
  onPress,
}: {
  item: RowItem;
  highlight: string;
  isCreating: boolean;
  anyCreating: boolean;
  onPress: (item: RowItem) => void;
}) {
  return (
    <Pressable
      className="flex-row items-center px-screen py-3 gap-3 active:opacity-70"
      onPress={() => onPress(item)}
      disabled={anyCreating}
    >
      <Avatar name={item.name} size="sm" />
      <View className="flex-1">
        <HighlightText
          text={item.name}
          highlight={highlight}
          className="font-inter-semibold text-body text-neutral-900"
        />
        {item.phone ? (
          <HighlightText
            text={item.phone}
            highlight={highlight}
            className="font-inter-regular text-caption text-neutral-500"
          />
        ) : null}
      </View>
      {isCreating ? (
        <ActivityIndicator size="small" color={colors.primary.blue[500]} />
      ) : item.existingRoom ? (
        <StSvg name="Chat_alt_2_fill" size={24} color={colors.neutral[900]} />
      ) : null}
    </Pressable>
  );
});

const Separator = () => <View className="mx-screen h-px bg-neutral-100" />;

const LIST_MAX_HEIGHT = 400;
const LIST_MIN_HEIGHT = 200;

export function NewChatSheet({ visible, onClose }: Props) {
  const { height } = useWindowDimensions();
  const { top, bottom } = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const auth = useRequiredAuth();
  const userId = auth?.userId;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  const available = height - top - bottom - keyboardHeight;
  const listHeight = Math.max(
    LIST_MIN_HEIGHT,
    Math.min(available * 0.5, LIST_MAX_HEIGHT),
  );

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isFetching: isCustomersFetching,
    isError: isCustomersError,
    refetch: refetchCustomers,
  } = useGetUserCustomersQuery(
    userId ? { userId, query: debouncedSearch || undefined } : { userId: 0 },
    { skip: !userId },
  );

  const { data: roomsData } = useGetChatRoomsInfiniteQuery({});

  const roomByCustomerId = useMemo(() => {
    const map = new Map<number, ChatRoom>();
    for (const page of roomsData?.pages ?? []) {
      for (const room of page.rooms) {
        if (room.interlocutor) {
          map.set(room.interlocutor.id, room);
        }
      }
    }
    return map;
  }, [roomsData]);

  const customers = useMemo<RowItem[]>(
    () =>
      (customersData?.user_customers ?? []).map((uc) => ({
        id: uc.customer.id,
        name: uc.customer.name,
        phone: uc.customer.phone,
        existingRoom: roomByCustomerId.get(uc.customer.id) ?? null,
      })),
    [customersData, roomByCustomerId],
  );

  const [createChatRoom] = useCreateChatRoomMutation();

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(text), 300);
  }, []);

  const handleSelect = useCallback(
    async (item: RowItem) => {
      if (!userId || creatingId !== null) return;

      if (item.existingRoom) {
        onClose();
        router.push(Routers.app.chat.room(item.existingRoom.id));
        return;
      }

      setCreatingId(item.id);
      try {
        const result = await createChatRoom({
          userId,
          customerId: item.id,
        }).unwrap();
        onClose();
        router.push(Routers.app.chat.room(result.id));
      } catch (err) {
        const message =
          (err as { data?: { error?: string } })?.data?.error ??
          "Не удалось открыть чат";
        toast.error(message);
      } finally {
        setCreatingId(null);
      }
    },
    [creatingId, createChatRoom, onClose, userId],
  );

  const renderItem = useCallback<ListRenderItem<RowItem>>(
    ({ item }) => (
      <CustomerRow
        item={item}
        highlight={debouncedSearch}
        isCreating={creatingId === item.id}
        anyCreating={creatingId !== null}
        onPress={handleSelect}
      />
    ),
    [debouncedSearch, creatingId, handleSelect],
  );

  useEffect(() => {
    if (!visible) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSearch("");
      setDebouncedSearch("");
      setCreatingId(null);
      setKeyboardHeight(0);
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  const isInitialLoading = isCustomersLoading && customers.length === 0;
  const isInitialError = isCustomersError && customers.length === 0;
  const isSearching = isCustomersFetching && !isInitialLoading;

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
      <View style={{ paddingBottom: keyboardHeight }}>
        <View className="px-screen pb-3">
          <Typography
            weight="semibold"
            className="text-display text-center pb-3"
          >
            Новый чат
          </Typography>
          <View className="flex-row items-center bg-background-surface rounded-xl px-3 gap-2">
            <StSvg name="Search" size={20} color={colors.neutral[400]} />
            <TextInput
              value={search}
              onChangeText={handleSearch}
              placeholder="Поиск клиента..."
              placeholderTextColor={colors.neutral[400]}
              returnKeyType="search"
              style={{
                flex: 1,
                paddingVertical: 10,
                minHeight: 48,
                fontSize: 16,
                color: colors.neutral[900],
              }}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={colors.neutral[400]} />
            ) : search.length > 0 ? (
              <Pressable onPress={() => handleSearch("")}>
                <StSvg
                  name="close_ring_fill_light"
                  size={24}
                  color={colors.neutral[400]}
                />
              </Pressable>
            ) : null}
          </View>
        </View>

        {isInitialLoading ? (
          <View
            className="items-center justify-center"
            style={{ height: LIST_MIN_HEIGHT }}
          >
            <ActivityIndicator color={colors.neutral[400]} />
          </View>
        ) : isInitialError ? (
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
              data={customers}
              keyExtractor={(item) => String(item.id)}
              keyboardShouldPersistTaps="handled"
              renderItem={renderItem}
              ItemSeparatorComponent={Separator}
              ListEmptyComponent={
                <View className="flex-1 items-center justify-center gap-4">
                  <StSvg
                    name="Chat_search"
                    size={60}
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
}
