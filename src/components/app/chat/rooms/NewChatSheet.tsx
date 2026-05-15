import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import { StModal } from "@/src/components/ui/StModal";
import { Avatar, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useRequiredAuth } from "@/src/hooks/useRequiredAuth";
import { useGetUserCustomersQuery } from "@/src/store/redux/services/api/userCustomersApi";
import RetryInline from "@/src/components/shared/retryInline";
import {
  useCreateChatRoomMutation,
  useGetChatRoomsQuery,
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
  isCreating,
  anyCreating,
  onPress,
}: {
  item: RowItem;
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
        <Typography weight="semibold" className="text-body text-neutral-900">
          {item.name}
        </Typography>
        {item.phone ? (
          <Typography className="text-caption text-neutral-500">
            {item.phone}
          </Typography>
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

export function NewChatSheet({ visible, onClose }: Props) {
  const { height } = useWindowDimensions();
  const auth = useRequiredAuth();
  const userId = auth?.userId;
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const {
    data: customersData,
    isLoading: isCustomersLoading,
    isError: isCustomersError,
    refetch: refetchCustomers,
  } = useGetUserCustomersQuery(
    userId ? { userId, query: debouncedSearch || undefined } : { userId: 0 },
    { skip: !userId },
  );

  const { data: roomsData } = useGetChatRoomsQuery(undefined);

  const roomByCustomerId = useMemo(() => {
    const map = new Map<number, ChatRoom>();
    for (const room of roomsData?.rooms ?? []) {
      if (room.interlocutor) {
        map.set(room.interlocutor.id, room);
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

  useEffect(() => {
    if (!visible) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      setSearch("");
      setDebouncedSearch("");
      setCreatingId(null);
    }
  }, [visible]);

  useEffect(
    () => () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    },
    [],
  );

  return (
    <StModal
      visible={visible}
      onClose={onClose}
      horizontalPadding={false}
      keyboardAware
    >
      <View className="px-screen pb-3">
        <Typography weight="semibold" className="text-body text-center mb-4">
          Новый чат
        </Typography>
        <View className="flex-row items-center bg-neutral-100 rounded-xl px-3 gap-2">
          <StSvg name="Search" size={18} color={colors.neutral[400]} />
          <TextInput
            value={search}
            onChangeText={handleSearch}
            placeholder="Поиск клиента..."
            placeholderTextColor={colors.neutral[400]}
            returnKeyType="search"
            style={{
              flex: 1,
              paddingVertical: 10,
              fontSize: 15,
              color: colors.neutral[900],
            }}
          />
          {search.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <StSvg
                name="close_ring_fill_light"
                size={18}
                color={colors.neutral[400]}
              />
            </Pressable>
          )}
        </View>
      </View>

      {isCustomersLoading && customers.length === 0 ? (
        <View className="items-center justify-center py-10">
          <ActivityIndicator color={colors.neutral[400]} />
        </View>
      ) : isCustomersError && customers.length === 0 ? (
        <View className="px-screen py-6">
          <RetryInline
            text="Не удалось загрузить клиентов"
            onRetry={refetchCustomers}
          />
        </View>
      ) : (
        <FlatList<RowItem>
          data={customers}
          keyExtractor={(item) => String(item.id)}
          keyboardShouldPersistTaps="handled"
          style={{ maxHeight: height * 0.5 }}
          renderItem={({ item }) => (
            <CustomerRow
              item={item}
              isCreating={creatingId === item.id}
              anyCreating={creatingId !== null}
              onPress={handleSelect}
            />
          )}
          ItemSeparatorComponent={() => (
            <View className="mx-screen h-px bg-neutral-100" />
          )}
          ListEmptyComponent={
            <View className="items-center justify-center py-10 gap-2">
              <Typography className="text-body text-neutral-400">
                {search ? "Клиенты не найдены" : "Нет клиентов"}
              </Typography>
            </View>
          }
        />
      )}
    </StModal>
  );
}
