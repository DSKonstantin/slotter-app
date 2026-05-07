import React from "react";
import { View } from "react-native";
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

type Props = {
  visible: boolean;
  onClose: () => void;
  roomId: number;
  name: string;
  phone?: string;
};

const ChatRoomMenu = ({ visible, onClose, roomId, name, phone }: Props) => {
  const { isNotify } = useGetChatRoomsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      isNotify: data?.rooms?.find((r) => r.id === roomId)?.is_notify ?? true,
    }),
  });

  const [updateMembership] = useUpdateMembershipMutation();

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
        <View className="items-center gap-2">
          <View className="w-14 h-14 rounded-full bg-background-surface items-center justify-center">
            <StSvg name="Phone_fill" size={24} color={colors.neutral[900]} />
          </View>
          <Typography
            weight="regular"
            className="text-caption text-neutral-500"
          >
            Позвонить
          </Typography>
        </View>

        <View className="items-center gap-2">
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
        </View>
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
