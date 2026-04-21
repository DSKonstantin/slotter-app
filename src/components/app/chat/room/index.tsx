import React, { useCallback, useMemo, useRef, useState } from "react";
import { Alert, View } from "react-native";
import * as Clipboard from "expo-clipboard";
import { GiftedChat } from "react-native-gifted-chat";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { shallowEqual } from "react-redux";
import type { ImagePickerAsset } from "expo-image-picker";
import type { DocumentPickerAsset } from "expo-document-picker";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import {
  Avatar,
  Button,
  IconButton,
  StSvg,
  Typography,
} from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";
import {
  useGetChatRoomsQuery,
  useUnblockChatRoomMutation,
} from "@/src/store/redux/services/api/chatRoomsApi";
import {
  useGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useDeleteChatMessageMutation,
  type ChatMessagesCache,
} from "@/src/store/redux/services/api/chatMessagesApi";
import type { ChatIMessage } from "@/src/utils/chat/types";
import type { PickedAssets } from "@/src/components/shared/imagePicker/imagePickerTrigger";
import ChatBubble from "./components/ChatBubble";
import ChatMessageImages from "./components/ChatMessageImages";
import ChatInputBar from "./components/ChatInputBar";
import ChatSendButton from "./components/ChatSendButton";
import ChatRoomMenu from "./components/ChatRoomMenu";
import ChatBubbleMenu from "./components/ChatBubbleMenu";
import ChatSystemMessage from "./components/ChatSystemMessage";
import ChatScrollBottomButton from "./components/ChatScrollBottomButton";
import ChatEmptyState from "./components/ChatEmptyState";
import ChatMessage from "./components/ChatMessage";
import ChatAppointmentWidget from "./components/ChatAppointmentWidget";
import AttachServiceSheet from "./components/AttachServiceSheet";
import type { Service } from "@/src/store/redux/services/api-types";

type Props = { roomId: string };

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const EMPTY_MESSAGES: ChatIMessage[] = [];

export default function ChatRoom({ roomId }: Props) {
  const id = Number(roomId);
  const { bottom: bottomInset } = useSafeAreaInsets();

  // ── Local UI State ─────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [menuMessage, setMenuMessage] = useState<ChatIMessage | null>(null);
  const [roomMenuVisible, setRoomMenuVisible] = useState(false);
  const [attachServiceVisible, setAttachServiceVisible] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ChatIMessage | null>(null);
  const loadingMoreRef = useRef(false);

  // ── Auth ──────────────────────────────────────────────────────────────
  const { currentUser, resourceType } = useAppSelector(
    (s) => ({ currentUser: s.auth.user, resourceType: s.auth.resourceType }),
    shallowEqual,
  );
  const currentGiftedId =
    resourceType && currentUser ? `${resourceType}_${currentUser.id}` : null;

  const userName = useMemo(
    () =>
      currentUser
        ? [currentUser.first_name, currentUser.last_name]
            .filter(Boolean)
            .join(" ") || String(currentUser.id)
        : "",
    [currentUser],
  );

  const makeUser = useCallback(
    () => ({
      _id: currentGiftedId ?? currentUser?.id ?? 0,
      name: userName,
      avatar: currentUser?.avatar_url ?? undefined,
    }),
    [currentGiftedId, currentUser, userName],
  );

  // ── Queries ───────────────────────────────────────────────────────────
  const { otherMember, blockedByMe, iAmBlocked, mutedByMe } =
    useGetChatRoomsQuery(undefined, {
      selectFromResult: ({ data }) => {
        const room = data?.chat_rooms?.find((r) => r.id === id);
        return {
          otherMember: room?.other_member ?? null,
          blockedByMe: room?.blocked_by_me ?? false,
          iAmBlocked: room?.i_am_blocked ?? false,
          mutedByMe: room?.muted_by_me ?? false,
        };
      },
    });

  const [unblockChatRoom] = useUnblockChatRoomMutation();

  const { data: chatData, isFetching } = useGetChatMessagesQuery(
    { chatRoomId: id, page },
    { skip: !id, refetchOnMountOrArgChange: true },
  );

  const messages = chatData?.messages ?? EMPTY_MESSAGES;
  const hasMore = chatData?.hasMore ?? false;
  const isTyping =
    (chatData as (ChatMessagesCache & { _typing?: boolean }) | undefined)
      ?._typing ?? false;

  // ── Mutations ─────────────────────────────────────────────────────────
  const [createMessage] = useCreateChatMessageMutation();
  const [deleteChatMessage] = useDeleteChatMessageMutation();

  // ── Pagination ────────────────────────────────────────────────────────
  const handleLoadEarlier = useCallback(() => {
    if (!hasMore || isFetching || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setPage((p) => p + 1);
  }, [hasMore, isFetching]);

  if (!isFetching) loadingMoreRef.current = false;

  // ── Send handlers ─────────────────────────────────────────────────────
  const onSend = useCallback(
    (newMessages: ChatIMessage[] = []) => {
      const msg = newMessages[0];
      if (!msg || !currentUser) return;

      const formData = new FormData();
      if (msg.text) formData.append("body", msg.text.trim());
      if (replyingTo?._id != null) {
        formData.append("replied_to_id", String(replyingTo._id));
      }

      createMessage({
        chatRoomId: id,
        data: formData,
        optimistic: {
          ...msg,
          _id: `temp_${Date.now()}`,
          createdAt: Date.now(),
          pending: true,
          sent: false,
          reply_to: replyingTo ?? null,
          user: makeUser(),
        },
      });

      if (replyingTo) setReplyingTo(null);
    },
    [id, currentUser, createMessage, replyingTo, makeUser],
  );

  const handleAttach = useCallback(
    (assets: PickedAssets) => {
      if (!currentUser || !assets.length) return;

      if (assets.length > MAX_IMAGES) {
        Alert.alert(
          "Ошибка",
          `Можно прикрепить не больше ${MAX_IMAGES} изображений`,
        );
        return;
      }

      const oversized = assets.some((a) => {
        const asset = a as ImagePickerAsset & DocumentPickerAsset;
        const size = asset.fileSize ?? asset.size;
        return size !== undefined && size > MAX_IMAGE_SIZE;
      });

      if (oversized) {
        Alert.alert(
          "Ошибка",
          "Размер каждого изображения не должен превышать 10 МБ",
        );
        return;
      }

      const firstAsset = assets[0] as ImagePickerAsset & DocumentPickerAsset;
      const firstMime = firstAsset.mimeType ?? "application/octet-stream";

      const formData = new FormData();
      for (const a of assets) {
        const asset = a as ImagePickerAsset & DocumentPickerAsset;
        formData.append("images[]", {
          uri: asset.uri,
          name: asset.fileName ?? asset.name ?? "image",
          type: asset.mimeType ?? "image/jpeg",
        } as unknown as Blob);
      }

      createMessage({
        chatRoomId: id,
        data: formData,
        optimistic: {
          _id: `temp_${Date.now()}`,
          text: "",
          createdAt: Date.now(),
          pending: true,
          sent: false,
          image: firstMime.startsWith("image/") ? firstAsset.uri : undefined,
          reply_to: null,
          user: makeUser(),
        },
      });
    },
    [id, currentUser, createMessage, makeUser],
  );

  const handleAttachWidget = useCallback(
    (service: Service) => {
      if (!currentUser) return;

      // TODO: working_day_id и start_time — моки, заменить на реальный выбор
      createMessage({
        chatRoomId: id,
        data: {
          service_id: service.id,
          working_day_id: 1,
          start_time: "10:00",
        },
        optimistic: {
          _id: `temp_${Date.now()}`,
          text: "",
          createdAt: Date.now(),
          pending: true,
          sent: false,
          reply_to: null,
          appointment: {
            id: -1,
            type: "Appointment",
            status: "offered",
            start_time: "10:00",
            end_time: "",
            date: "",
            duration: 0,
            price_cents: 0,
            price_currency: "",
            payment_method: "",
            comment: null,
            cancel_reason: null,
            send_notification: false,
            public_token: "",
            customer_confirmed_at: null,
            customer: null,
            services: [],
            additional_services: [],
          },
          user: makeUser(),
        },
      });
    },
    [id, currentUser, createMessage, makeUser],
  );

  const handleDelete = useCallback(
    (message: ChatIMessage) => {
      if (typeof message._id === "string") return;
      deleteChatMessage({
        chatRoomId: id,
        messageId: message._id as number,
      });
    },
    [id, deleteChatMessage],
  );

  // ── Message actions ───────────────────────────────────────────────────
  const handleReply = useCallback((message: ChatIMessage) => {
    setReplyingTo(message);
  }, []);

  const handleCopy = useCallback((message: ChatIMessage) => {
    if (message.text) void Clipboard.setStringAsync(message.text);
  }, []);

  const onLongPressMessage = useCallback(
    (_context: unknown, message: ChatIMessage) => setMenuMessage(message),
    [],
  );

  // ── Render ────────────────────────────────────────────────────────────
  const titleNode = useMemo(
    () =>
      otherMember ? (
        <View className="flex-row items-center gap-2 max-w-full">
          <Avatar
            name={otherMember.name}
            uri={otherMember.avatar_url ?? undefined}
            size="xs"
          />
          <Typography
            weight="semibold"
            className="shrink text-[17px] leading-[22px]"
            numberOfLines={2}
          >
            {otherMember.name}
          </Typography>
        </View>
      ) : undefined,
    [otherMember],
  );

  return (
    <>
      <ScreenWithToolbar
        title={titleNode ?? "Чат"}
        rightButton={
          <IconButton
            icon={
              <StSvg
                name="Meatballs_menu"
                size={28}
                color={colors.neutral[900]}
              />
            }
            onPress={() => setRoomMenuVisible(true)}
          />
        }
      >
        {({ topInset }) => (
          <SafeAreaView className="flex-1" edges={["left", "right"]}>
            <GiftedChat<ChatIMessage>
              messages={messages}
              onSend={onSend}
              user={{ _id: currentGiftedId ?? 0 }}
              locale="ru"
              timeFormat="HH:mm"
              dateFormatCalendar={{
                sameDay: "[Сегодня]",
                lastDay: "[Вчера]",
                lastWeek: "D MMMM",
                sameElse: "D MMMM YYYY",
              }}
              isSendButtonAlwaysVisible
              minInputToolbarHeight={0}
              keyboardAvoidingViewProps={{
                keyboardVerticalOffset: -bottomInset + 8,
              }}
              isTyping={isTyping}
              textInputProps={{
                placeholder: "Сообщение...",
                maxLength: undefined,
                multiline: true,
                numberOfLines: 5,
                style: {
                  backgroundColor: colors.background.surface,
                  borderRadius: 20,
                  paddingHorizontal: 16,
                  paddingTop: 12,
                  paddingBottom: 12,
                  marginHorizontal: 4,
                  flex: 1,
                  maxHeight: 120,
                },
              }}
              onLongPressMessage={onLongPressMessage}
              loadEarlierMessagesProps={{
                isAvailable: hasMore,
                isLoading: isFetching && page > 1,
                onPress: handleLoadEarlier,
                label: "Загрузить ранее",
              }}
              scrollToBottomComponent={() => <ChatScrollBottomButton />}
              renderAvatar={null}
              renderMessage={(props) => <ChatMessage {...props} />}
              renderBubble={(props) => {
                const msg = props.currentMessage as ChatIMessage | undefined;
                if (msg?.appointment) {
                  return (
                    <ChatAppointmentWidget
                      appointment={msg.appointment}
                      isOwnMessage={msg.user._id === (currentGiftedId ?? 0)}
                      onLongPress={() => setMenuMessage(msg)}
                    />
                  );
                }
                return <ChatBubble {...props} />;
              }}
              renderMessageImage={(props) => <ChatMessageImages {...props} />}
              renderInputToolbar={(props) =>
                blockedByMe || iAmBlocked ? (
                  <View className="absolute bottom-0 left-0 right-0 items-center justify-center py-4 px-6 bg-background-surface gap-2">
                    <Typography className="text-caption text-neutral-500 text-center">
                      {blockedByMe
                        ? "Вы заблокировали пользователя"
                        : "Пользователь ограничил переписку"}
                    </Typography>
                    {blockedByMe && (
                      <Button
                        title="Разблокировать"
                        variant="clear"
                        size="sm"
                        textClassName="text-accent-red-500"
                        onPress={() => unblockChatRoom({ chatRoomId: id })}
                      />
                    )}
                  </View>
                ) : (
                  <ChatInputBar
                    {...props}
                    replyingTo={replyingTo}
                    onCancelReply={() => setReplyingTo(null)}
                    onAttach={handleAttach}
                    isUser={resourceType === "user"}
                    onAttachService={() => setAttachServiceVisible(true)}
                  />
                )
              }
              renderSend={(props) => <ChatSendButton {...props} />}
              renderSystemMessage={(props) => <ChatSystemMessage {...props} />}
              renderChatEmpty={() => <ChatEmptyState />}
              messagesContainerStyle={{
                backgroundColor: colors.background.DEFAULT,
              }}
              listProps={{
                contentContainerStyle: {
                  paddingTop: 70 + bottomInset,
                  paddingBottom: topInset,
                  flexGrow: 1,
                },
                onEndReached: handleLoadEarlier,
                onEndReachedThreshold: 0.2,
              }}
            />
          </SafeAreaView>
        )}
      </ScreenWithToolbar>

      {otherMember && (
        <ChatRoomMenu
          visible={roomMenuVisible}
          onClose={() => setRoomMenuVisible(false)}
          roomId={id}
          name={otherMember.name}
          blockedByMe={blockedByMe}
          iAmBlocked={iAmBlocked}
          mutedByMe={mutedByMe}
        />
      )}

      <AttachServiceSheet
        visible={attachServiceVisible}
        onClose={() => setAttachServiceVisible(false)}
        onSelect={handleAttachWidget}
      />

      <ChatBubbleMenu
        visible={!!menuMessage}
        onClose={() => setMenuMessage(null)}
        message={menuMessage}
        isOwnMessage={menuMessage?.user?._id === currentGiftedId}
        onReply={handleReply}
        onCopy={handleCopy}
        onDelete={handleDelete}
      />
    </>
  );
}
