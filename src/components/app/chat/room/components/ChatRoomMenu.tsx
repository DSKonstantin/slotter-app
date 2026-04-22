import React from "react";
import { Alert, View, Pressable } from "react-native";
import { useRouter } from "expo-router";
import {
  Button,
  Avatar,
  StModal,
  StSvg,
  Switch,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  useDeleteChatRoomMutation,
  useBlockChatRoomMutation,
  useUnblockChatRoomMutation,
  useMuteChatRoomMutation,
} from "@/src/store/redux/services/api/chatRoomsApi";

type Props = {
  visible: boolean;
  onClose: () => void;
  roomId: number;
  name: string;
  phone?: string;
  blockedByMe: boolean;
  iAmBlocked: boolean;
  mutedByMe: boolean;
};

const ChatRoomMenu = ({
  visible,
  onClose,
  roomId,
  name,
  phone,
  blockedByMe,
  iAmBlocked,
  mutedByMe,
}: Props) => {
  const router = useRouter();

  const [deleteChatRoom] = useDeleteChatRoomMutation();
  const [blockChatRoom] = useBlockChatRoomMutation();
  const [unblockChatRoom] = useUnblockChatRoomMutation();
  const [muteChatRoom] = useMuteChatRoomMutation();

  const handleToggleBlock = async () => {
    try {
      if (blockedByMe) {
        await unblockChatRoom({ chatRoomId: roomId }).unwrap();
      } else {
        await blockChatRoom({ chatRoomId: roomId }).unwrap();
      }
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      "Удалить переписку",
      "Вы уверены? История сообщений будет скрыта.",
      [
        { text: "Отмена", style: "cancel" },
        {
          text: "Удалить",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteChatRoom({ chatRoomId: roomId }).unwrap();
              onClose();
              router.back();
            } catch (e) {
              console.error(e);
            }
          },
        },
      ],
    );
  };

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="items-center pb-6 gap-1">
        <Avatar name={name} size="md" />
        <Typography weight="semibold" className="text-body">
          {name}
        </Typography>
        {phone && (
          <Typography className="text-caption text-neutral-500">
            {phone}
          </Typography>
        )}
      </View>

      <View className="flex-row gap-4 justify-around mb-6">
        <Pressable
          className="items-center gap-2 active:opacity-70"
          onPress={() => {}}
        >
          <View className="w-14 h-14 rounded-full bg-background-surface items-center justify-center">
            <StSvg name="Phone_fill" size={24} color={colors.neutral[900]} />
          </View>
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
          >
            Позвонить
          </Typography>
        </Pressable>

        <Pressable
          className="items-center gap-2 active:opacity-70"
          onPress={() => {}}
        >
          <View className="w-14 h-14 rounded-full bg-background-surface items-center justify-center">
            <StSvg
              name="File_dock_search_fill"
              size={24}
              color={colors.neutral[900]}
            />
          </View>
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
          >
            История записей
          </Typography>
        </Pressable>
      </View>

      <View className="rounded-2xl bg-white border border-background overflow-hidden mb-4">
        <View className="flex-row items-center justify-between px-4 min-h-[56px]">
          <Typography className="text-body">Уведомления</Typography>
          <Switch
            value={!mutedByMe}
            onChange={(enabled) => {
              muteChatRoom({ chatRoomId: roomId, muted: !enabled });
            }}
          />
        </View>
      </View>

      <View className="gap-2">
        <Button
          title={blockedByMe ? "Разблокировать" : "Заблокировать"}
          variant="clear"
          textClassName="text-accent-red-500"
          onPress={handleToggleBlock}
          rightIcon={
            <StSvg
              name="Cancel"
              size={20}
              color={blockedByMe ? colors.neutral[500] : colors.accent.red[500]}
            />
          }
        />
        <Button
          title="Удалить переписку"
          variant="clear"
          textClassName="text-accent-red-500"
          onPress={handleDelete}
          rightIcon={
            <StSvg name="Trash" size={20} color={colors.accent.red[500]} />
          }
        />
      </View>
    </StModal>
  );
};

export default ChatRoomMenu;
