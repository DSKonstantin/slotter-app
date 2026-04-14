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
import { useGetCustomersQuery } from "@/src/store/redux/services/api/customersApi";
import {
  useCreateChatRoomMutation,
  useGetChatRoomsQuery,
} from "@/src/store/redux/services/api/chatRoomsApi";
import { Routers } from "@/src/constants/routers";
import type { ChatRoom, Customer } from "@/src/store/redux/services/api-types";

type RowItem = Customer & { existingRoom: ChatRoom | null };

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
        <StSvg name="Chat_alt_2" size={18} color={colors.neutral[400]} />
      ) : null}
    </Pressable>
  );
});

export function NewChatSheet({ visible, onClose }: Props) {
  const { height } = useWindowDimensions();
  const auth = useRequiredAuth();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [creatingId, setCreatingId] = useState<number | null>(null);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data: customersData } = useGetCustomersQuery(
    auth
      ? { userId: auth.userId, query: debouncedSearch || undefined }
      : { userId: 0 },
    { skip: !auth },
  );

  const { data: roomsData } = useGetChatRoomsQuery(undefined);

  const roomByCustomerId = useMemo(() => {
    const map = new Map<number, ChatRoom>();
    for (const room of roomsData?.chat_rooms ?? []) {
      if (room.other_member) {
        map.set(room.other_member.id, room);
      }
    }
    return map;
  }, [roomsData]);

  const customers = useMemo<RowItem[]>(
    () =>
      (customersData?.customers ?? []).map((c) => ({
        ...c,
        existingRoom: roomByCustomerId.get(c.id) ?? null,
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
      if (creatingId !== null) return;

      if (item.existingRoom) {
        onClose();
        router.push(Routers.app.chat.room(item.existingRoom.id));
        return;
      }

      setCreatingId(item.id);
      try {
        const result = await createChatRoom({ memberId: item.id }).unwrap();
        onClose();
        router.push(Routers.app.chat.room(result.chat_room.id));
      } catch (err) {
        const message =
          (err as { data?: { error?: string } })?.data?.error ??
          "Не удалось открыть чат";
        toast.error(message);
      } finally {
        setCreatingId(null);
      }
    },
    [creatingId, createChatRoom, onClose],
  );

  useEffect(() => {
    if (!visible) {
      setSearch("");
      setDebouncedSearch("");
      setCreatingId(null);
    }
  }, [visible]);

  return (
    <StModal visible={visible} onClose={onClose} horizontalPadding={false}>
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
    </StModal>
  );
}
