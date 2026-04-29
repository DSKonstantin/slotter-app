import React, { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, View } from "react-native";
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
import { Avatar, IconButton, StSvg, Typography } from "@/src/components/ui";
import { colors } from "@/src/styles/colors";
import { useAppSelector } from "@/src/store/redux/store";
import {
  useGetChatRoomsQuery,
  useMarkRoomReadMutation,
} from "@/src/store/redux/services/api/chatRoomsApi";
import {
  useGetChatMessagesQuery,
  useCreateChatMessageMutation,
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
import {
  AttachSheet,
  ChatAppointmentWidget,
  ChatServiceWidget,
} from "./components/widget";
import { useCreateAppointmentMutation } from "@/src/store/redux/services/api/appointmentsApi";
import { toast } from "@backpackapp-io/react-native-toast";
import { getApiErrorMessage } from "@/src/utils/apiError";
import type { Service } from "@/src/store/redux/services/api-types";

type Props = { roomId: string };

const MAX_IMAGES = 10;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const EMPTY_MESSAGES: ChatIMessage[] = [];

export default function ChatRoom({ roomId }: Props) {
  const id = Number(roomId);
  const { bottom: bottomInset } = useSafeAreaInsets();

  // ── Local UI State ─────────────────────────────────────────────────────
  const [cursor, setCursor] = useState<string | undefined>(undefined);
  const [menuMessage, setMenuMessage] = useState<ChatIMessage | null>(null);
  const [roomMenuVisible, setRoomMenuVisible] = useState(false);
  const [attachVisible, setAttachVisible] = useState(false);
  const [isProposing, setIsProposing] = useState(false);
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
  // selectFromResult must return an object (RTK Query merges it with the
  // query state) — returning a primitive or null breaks the typing.
  const { interlocutor } = useGetChatRoomsQuery(undefined, {
    selectFromResult: ({ data }) => ({
      interlocutor: data?.rooms?.find((r) => r.id === id)?.interlocutor ?? null,
    }),
  });

  const [markRoomRead] = useMarkRoomReadMutation();

  const {
    data: chatData,
    isFetching,
    isLoading,
  } = useGetChatMessagesQuery(
    { chatRoomId: id, cursor },
    { skip: !id, refetchOnMountOrArgChange: true },
  );

  const messages = chatData?.messages ?? EMPTY_MESSAGES;
  const hasMore = chatData?.hasMore ?? false;

  // ── Mutations ─────────────────────────────────────────────────────────
  const [createMessage] = useCreateChatMessageMutation();
  const [createAppointment] = useCreateAppointmentMutation();

  // ── Mark read on mount ────────────────────────────────────────────────
  React.useEffect(() => {
    if (id) markRoomRead({ chatRoomId: id });
  }, [id, markRoomRead]);

  // ── Pagination ────────────────────────────────────────────────────────
  const handleLoadEarlier = useCallback(() => {
    if (!hasMore || isFetching || loadingMoreRef.current) return;
    loadingMoreRef.current = true;
    setCursor(chatData?.nextCursor ?? undefined);
  }, [hasMore, isFetching, chatData?.nextCursor]);

  if (!isFetching) loadingMoreRef.current = false;

  // ── Send handlers ─────────────────────────────────────────────────────
  const onSend = useCallback(
    (newMessages: ChatIMessage[] = []) => {
      const msg = newMessages[0];
      if (!msg || !currentUser) return;

      const formData = new FormData();
      if (msg.text) formData.append("body", msg.text.trim());
      if (replyingTo && typeof replyingTo._id === "number") {
        formData.append("reply_to_id", String(replyingTo._id));
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

      createMessage({
        chatRoomId: id,
        data: {
          chat_widget: {
            kind: "service_card",
            widgetable_type: "Service",
            widgetable_id: service.id,
            payload: {},
          },
        },
        optimistic: {
          _id: `temp_${Date.now()}`,
          text: "",
          createdAt: Date.now(),
          pending: true,
          sent: false,
          reply_to: null,
          widget: {
            id: -1,
            kind: "service_card",
            payload: {},
            created_at: new Date().toISOString(),
            widgetable: {
              id: service.id,
              name: service.name,
              duration: service.duration,
              price_cents: service.price_cents,
              price_currency: service.price_currency,
              main_photo_url: service.main_photo_url ?? null,
            },
          },
          user: makeUser(),
        },
      });
    },
    [id, currentUser, createMessage, makeUser],
  );

  const handleProposeAppointment = useCallback(
    async ({
      service,
      date,
      startTime,
    }: {
      service: Service;
      date: string;
      startTime: string;
    }) => {
      if (!currentUser) return;
      if (!interlocutor || interlocutor.type !== "Customer") {
        toast.error("Запись можно предложить только клиенту");
        return;
      }

      setIsProposing(true);
      try {
        const appointment = await createAppointment({
          userId: currentUser.id,
          body: {
            customer_id: interlocutor.id,
            date,
            start_time: startTime,
            service_ids: [service.id],
            duration: service.duration,
            price_cents: service.price_cents,
          },
        }).unwrap();

        createMessage({
          chatRoomId: id,
          data: {
            chat_widget: {
              kind: "appointment_proposal",
              widgetable_type: "Appointment",
              widgetable_id: appointment.id,
              payload: {
                start_time: startTime,
                duration: service.duration,
                price_cents: service.price_cents,
              },
            },
          },
          optimistic: {
            _id: `temp_${Date.now()}`,
            text: "",
            createdAt: Date.now(),
            pending: true,
            sent: false,
            reply_to: null,
            widget: {
              id: -1,
              kind: "appointment_proposal",
              payload: {
                start_time: startTime,
                duration: service.duration,
                price_cents: service.price_cents,
              },
              created_at: new Date().toISOString(),
              widgetable: {
                id: appointment.id,
                status: appointment.status,
                start_time: appointment.start_time,
                end_time: appointment.end_time,
                date: appointment.date,
                duration: appointment.duration,
                price_cents: appointment.price_cents,
                price_currency: appointment.price_currency,
              },
            },
            user: makeUser(),
          },
        });

        setAttachVisible(false);
      } catch (error) {
        toast.error(getApiErrorMessage(error, "Не удалось создать запись"));
      } finally {
        setIsProposing(false);
      }
    },
    [id, currentUser, interlocutor, createAppointment, createMessage, makeUser],
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
      interlocutor ? (
        <View className="flex-row items-center gap-2 max-w-full">
          <Avatar
            name={interlocutor.name}
            uri={interlocutor.avatar_url ?? undefined}
            size="xs"
          />
          <Typography
            weight="semibold"
            className="shrink text-[17px] leading-[22px]"
            numberOfLines={2}
          >
            {interlocutor.name}
          </Typography>
        </View>
      ) : undefined,
    [interlocutor],
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
                isLoading: isFetching && !!cursor,
                onPress: handleLoadEarlier,
                label: "Загрузить ранее",
              }}
              scrollToBottomComponent={() => <ChatScrollBottomButton />}
              renderAvatar={null}
              renderMessage={(props) => <ChatMessage {...props} />}
              renderBubble={(props) => {
                const msg = props.currentMessage as ChatIMessage | undefined;
                const widget = msg?.widget;
                if (widget) {
                  const isOwnMessage = msg.user._id === (currentGiftedId ?? 0);
                  if (widget.kind === "service_card") {
                    return (
                      <ChatServiceWidget
                        service={widget.widgetable}
                        onLongPress={() => setMenuMessage(msg)}
                      />
                    );
                  }
                  if (widget.kind === "appointment_proposal") {
                    return (
                      <ChatAppointmentWidget
                        appointment={widget.widgetable}
                        payload={widget.payload}
                        isOwnMessage={isOwnMessage}
                        onLongPress={() => setMenuMessage(msg)}
                      />
                    );
                  }
                }
                return <ChatBubble {...props} />;
              }}
              renderMessageImage={(props) => <ChatMessageImages {...props} />}
              renderInputToolbar={(props) => (
                <ChatInputBar
                  {...props}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                  onAttach={handleAttach}
                  isUser={resourceType === "user"}
                  onOpenAttachMenu={() => setAttachVisible(true)}
                />
              )}
              renderSend={(props) => <ChatSendButton {...props} />}
              renderSystemMessage={(props) => <ChatSystemMessage {...props} />}
              renderChatEmpty={() =>
                isLoading ? (
                  <View
                    className="flex-1 items-center justify-center pb-20"
                    style={{ transform: [{ scaleY: -1 }] }}
                  >
                    <ActivityIndicator color={colors.neutral[500]} />
                  </View>
                ) : (
                  <ChatEmptyState />
                )
              }
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

      {interlocutor && (
        <ChatRoomMenu
          visible={roomMenuVisible}
          onClose={() => setRoomMenuVisible(false)}
          roomId={id}
          name={interlocutor.name}
        />
      )}

      {currentUser && (
        <AttachSheet
          visible={attachVisible}
          onClose={() => setAttachVisible(false)}
          userId={currentUser.id}
          isSubmitting={isProposing}
          onPickService={handleAttachWidget}
          onProposeAppointment={handleProposeAppointment}
        />
      )}

      <ChatBubbleMenu
        visible={!!menuMessage}
        onClose={() => setMenuMessage(null)}
        message={menuMessage}
        isOwnMessage={menuMessage?.user?._id === currentGiftedId}
        onReply={handleReply}
        onCopy={handleCopy}
      />
    </>
  );
}
