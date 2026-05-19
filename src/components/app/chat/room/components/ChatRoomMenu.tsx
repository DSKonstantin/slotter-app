import React from "react";
import { Linking, Pressable, View } from "react-native";
import { router } from "expo-router";
import { toast } from "@backpackapp-io/react-native-toast";
import {
  Avatar,
  StModal,
  StSvg,
  Switch,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import {
  useGetChatRoomsQuery,
  useUpdateMembershipMutation,
} from "@/src/store/redux/services/api/chatRoomsApi";
import type { ChatRoomInterlocutor } from "@/src/store/redux/services/api-types";
import { Routers } from "@/src/constants/routers";

type Props = {
  visible: boolean;
  onClose: () => void;
  roomId: number;
  interlocutor: ChatRoomInterlocutor;
};

const ChatRoomMenu = ({ visible, onClose, roomId, interlocutor }: Props) => {
  const { name, phone, avatar_url } = interlocutor;

  const handleCall = () => {
    if (!phone) return;
    const clean = phone.replace(/[^\d+]/g, "");
    Linking.openURL(`tel:${clean}`).catch(() =>
      toast.error("Не удалось открыть звонок"),
    );
  };

  const handleHistory = () => {
    onClose();
    router.push(Routers.app.clients.history(interlocutor.id));
  };

  const { isNotify } = useGetChatRoomsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      isNotify: data?.rooms?.find((r) => r.id === roomId)?.is_notify ?? true,
    }),
  });

  const [updateMembership] = useUpdateMembershipMutation();

  return (
    <StModal visible={visible} onClose={onClose}>
      <View className="items-center pb-6 gap-1">
        <Avatar name={name} uri={avatar_url ?? undefined} size="md" />
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
          onPress={handleCall}
          disabled={!phone}
        >
          <View
            className="w-14 h-14 rounded-full bg-background-surface items-center justify-center"
            style={{ opacity: phone ? 1 : 0.4 }}
          >
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
          onPress={handleHistory}
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

      <View className="rounded-2xl bg-white border border-background overflow-hidden">
        <View className="flex-row items-center justify-between px-4 min-h-[56px]">
          <Typography className="text-body">Уведомления</Typography>
          <Switch
            value={isNotify}
            onChange={(enabled) => {
              updateMembership({ chatRoomId: roomId, is_notify: enabled });
            }}
          />
        </View>
      </View>
    </StModal>
  );
};

export default ChatRoomMenu;
