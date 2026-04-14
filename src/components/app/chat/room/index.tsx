import React, {
  useCallback,
  useEffect,
  useState,
} from "react";
import { Clipboard, View } from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import ScreenWithToolbar from "@/src/components/shared/layout/screenWithToolbar";
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppDispatch, useAppSelector } from "@/src/store/redux/store";
import { chatActions } from "@/src/store/redux/slices/chatSlice";
import { useChatRoomChannel } from "@/src/hooks/useChatRoomChannel";
import { useGetChatRoomQuery } from "@/src/store/redux/services/api/chatRoomsApi";
import {
  useGetChatMessagesQuery,
  useLazyGetChatMessagesQuery,
  useCreateChatMessageMutation,
  useDeleteChatMessageMutation,
} from "@/src/store/redux/services/api/chatMessagesApi";
import { toIMessage } from "@/src/utils/chat/toIMessage";
import type { ChatIMessage } from "@/src/utils/chat/types";
import type { ChatMessage } from "@/src/store/redux/services/api-types";
import ChatBubble from "./components/ChatBubble";
import ChatInputToolbar from "./components/ChatInputToolbar";
import ChatSendButton from "./components/ChatSendButton";
import ChatRoomMenu from "./components/ChatRoomMenu";
import ChatBubbleMenu from "./components/ChatBubbleMenu";
import ChatReplyFooter from "./components/ChatReplyFooter";
import ChatSystemMessage from "./components/ChatSystemMessage";
import ChatScrollBottomButton from "./components/ChatScrollBottomButton";
import ChatEmptyState from "./components/ChatEmptyState";

type Props = { roomId: string };

const PAGE_SIZE = 30;

export default function ChatRoom({ roomId }: Props) {
  const id = Number(roomId);
  useChatRoomChannel(id);
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector((state) => state.auth.user);
  const resourceType = useAppSelector((state) => state.auth.resourceType);
  const currentGiftedId =
    resourceType && currentUser ? `${resourceType}_${currentUser.id}` : null;

  // ── Room info ────────────────────────────────────────────────────────────
  const { data: roomData } = useGetChatRoomQuery({ chatRoomId: id });
  const otherMember = roomData?.chat_room?.other_member;

  // ── Slice state ──────────────────────────────────────────────────────────
  const messages = useAppSelector((s) => s.chat.rooms[id]?.messages) ?? [];
  const hasMore = useAppSelector((s) => s.chat.rooms[id]?.hasMore) ?? true;
  const isTyping = useAppSelector((s) => s.chat.typing[id]) ?? false;
  const replyingTo = useAppSelector((s) => s.chat.replyingTo[id]) as
    | ChatIMessage
    | null
    | undefined;
  const nextPage = (useAppSelector((s) => s.chat.rooms[id]?.page) ?? 1) + 1;

  // ── Initial load ─────────────────────────────────────────────────────────
  const { data: initialData } = useGetChatMessagesQuery(
    { chatRoomId: id, page: 1 },
    { skip: !id },
  );

  useEffect(() => {
    if (!initialData) return;
    dispatch(chatActions.initRoom({ roomId: id }));
    dispatch(
      chatActions.setMessages({
        roomId: id,
        messages: initialData.chat_messages.map(toIMessage),
        page: 1,
        hasMore: initialData.chat_messages.length === PAGE_SIZE,
      }),
    );
  }, [initialData, id, dispatch]);

  // ── Pagination ───────────────────────────────────────────────────────────
  const [fetchMessages] = useLazyGetChatMessagesQuery();
  const [loadingMore, setLoadingMore] = useState(false);

  const handleLoadEarlier = useCallback(async () => {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const result = await fetchMessages({
        chatRoomId: id,
        page: nextPage,
      }).unwrap();
      dispatch(
        chatActions.setMessages({
          roomId: id,
          messages: result.chat_messages.map(toIMessage),
          page: nextPage,
          hasMore: result.chat_messages.length === PAGE_SIZE,
        }),
      );
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, fetchMessages, id, nextPage, dispatch]);

  // ── Send ─────────────────────────────────────────────────────────────────
  const [createMessage] = useCreateChatMessageMutation();

  const onSend = useCallback(
    async (newMessages: ChatIMessage[] = []) => {
      const msg = newMessages[0];
      if (!msg || !currentUser) return;

      const tempId = `temp_${Date.now()}`;
      const optimistic: ChatIMessage = {
        ...msg,
        _id: tempId,
        createdAt: Date.now(),
        pending: true,
        sent: false,
        reply_to: replyingTo ?? null,
        user: {
          _id: currentGiftedId ?? currentUser.id,
          name:
            [currentUser.first_name, currentUser.last_name]
              .filter(Boolean)
              .join(" ") || String(currentUser.id),
          avatar: currentUser.avatar_url ?? undefined,
        },
      };

      dispatch(chatActions.pushMessage({ roomId: id, message: optimistic }));

      // Clear reply state before sending
      if (replyingTo) {
        dispatch(chatActions.setReplyingTo({ roomId: id, message: null }));
      }

      const formData = new FormData();
      if (msg.text) formData.append("body", msg.text.trim());
      if (replyingTo?._id != null) {
        formData.append("replied_to_id", String(replyingTo._id));
      }

      try {
        const { chat_message } = await createMessage({
          chatRoomId: id,
          data: formData,
        }).unwrap();
        dispatch(
          chatActions.updateMessage({
            roomId: id,
            tempId,
            message: toIMessage(chat_message),
          }),
        );
      } catch {
        dispatch(chatActions.removeMessage({ roomId: id, messageId: tempId }));
      }
    },
    [id, currentUser, currentGiftedId, createMessage, dispatch, replyingTo],
  );

  // ── Delete ───────────────────────────────────────────────────────────────
  const [deleteChatMessage] = useDeleteChatMessageMutation();

  const handleDelete = useCallback(
    async (message: ChatIMessage) => {
      if (typeof message._id === "string") return; // temp message
      dispatch(
        chatActions.removeMessage({ roomId: id, messageId: message._id }),
      );
      try {
        await deleteChatMessage({
          chatRoomId: id,
          messageId: message._id as number,
        }).unwrap();
      } catch {
        // Re-add on failure
        dispatch(chatActions.pushMessage({ roomId: id, message }));
      }
    },
    [id, deleteChatMessage, dispatch],
  );

  // ── Bubble menu (long-press) ─────────────────────────────────────────────
  const [menuMessage, setMenuMessage] = useState<ChatIMessage | null>(null);

  const onLongPressMessage = useCallback(
    (_context: unknown, message: ChatIMessage) => {
      setMenuMessage(message);
    },
    [],
  );

  const handleReply = useCallback(
    (message: ChatIMessage) => {
      dispatch(chatActions.setReplyingTo({ roomId: id, message }));
    },
    [id, dispatch],
  );

  const handleCopy = useCallback((message: ChatIMessage) => {
    if (message.text) Clipboard.setString(message.text);
  }, []);

  // ── UI ───────────────────────────────────────────────────────────────────
  const [roomMenuVisible, setRoomMenuVisible] = useState(false);

  const titleNode = otherMember ? (
    <View className="flex-row items-center gap-2">
      <Avatar name={otherMember.name} size="xs" />
      <Typography weight="semibold" className="text-[17px] leading-[22px]">
        {otherMember.name}
      </Typography>
    </View>
  ) : undefined;

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
          <SafeAreaView className="flex-1" edges={["left", "right", "bottom"]}>
            <GiftedChat<ChatIMessage>
              messages={messages}
              onSend={onSend}
              user={{ _id: currentGiftedId ?? 0 }}
              locale="ru"
              isSendButtonAlwaysVisible
              isTyping={isTyping}
              textInputProps={{ placeholder: "Сообщение..." }}
              onLongPressMessage={onLongPressMessage}
              loadEarlierMessagesProps={{
                isAvailable: hasMore,
                isLoading: loadingMore,
                onPress: handleLoadEarlier,
              }}
              scrollToBottomComponent={() => <ChatScrollBottomButton />}
              renderBubble={(props) => <ChatBubble {...props} />}
              renderInputToolbar={(props) => (
                <View>
                  {replyingTo && (
                    <ChatReplyFooter
                      message={replyingTo}
                      onCancel={() =>
                        dispatch(
                          chatActions.setReplyingTo({
                            roomId: id,
                            message: null,
                          }),
                        )
                      }
                    />
                  )}
                  <ChatInputToolbar {...props} />
                </View>
              )}
              renderSend={(props) => <ChatSendButton {...props} />}
              renderSystemMessage={(props) => <ChatSystemMessage {...props} />}
              renderChatEmpty={() => <ChatEmptyState />}
              messagesContainerStyle={{
                backgroundColor: colors.background.DEFAULT,
              }}
              listProps={{
                contentContainerStyle: { paddingBottom: topInset },
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
          name={otherMember.name}
          phone={otherMember.phone}
        />
      )}

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
