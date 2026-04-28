export interface ChatRoomInterlocutor {
  id: number;
  type: string;
  name: string;
  avatar_url: string | null;
}

export interface ChatRoom {
  id: number;
  interlocutor: ChatRoomInterlocutor | null;
  unread_count: number;
  is_notify: boolean | null;
  last_activity_at: string;
  created_at: string;
}

export type GetChatRoomsParams = {
  per_count?: number;
};

export interface PaginationMeta {
  count: number;
  page: number;
  items: number;
  pages: number;
}

export interface GetChatRoomsResponse {
  rooms: ChatRoom[];
  pagination: PaginationMeta;
}

// --- Messages ---

export interface ChatMessageImage {
  id: number;
  url: string;
  content_type: string;
  byte_size: number;
  blurhash: string | null;
}

export interface ChatWidgetAppointmentService {
  id: number;
  name: string;
  duration: number;
  price_cents: number;
}

export interface ChatMessageWidgetAppointment {
  id: number;
  status: string;
  start_time: string;
  end_time: string;
  date: string;
  duration: number;
  price_cents: number;
  price_currency: string;
  payment_method?: string;
  comment?: string | null;
  cancel_reason?: string | null;
  send_notification?: boolean;
  public_token?: string;
  customer_confirmed_at?: string | null;
  customer?: {
    id: number;
    name: string;
    avatar_url: string | null;
  } | null;
  services?: ChatWidgetAppointmentService[];
  additional_services?: ChatWidgetAppointmentService[];
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface ChatWidgetService {
  id: number;
  name: string;
  duration: number;
  price_cents: number;
  price_currency: string;
  main_photo_url: string | null;
}

export type ChatWidgetKind = "service_card" | "appointment_proposal";

export interface ChatWidgetAppointmentPayload {
  start_time?: string;
  duration?: number;
  price_cents?: number;
}

export type ChatWidget =
  | {
      id: number;
      kind: "service_card";
      payload: Record<string, never>;
      created_at: string;
      widgetable: ChatWidgetService | null;
    }
  | {
      id: number;
      kind: "appointment_proposal";
      payload: ChatWidgetAppointmentPayload;
      created_at: string;
      widgetable: ChatMessageWidgetAppointment | null;
    };

export interface ChatMessage {
  id: number;
  body: string | null;
  owner: ChatRoomInterlocutor;
  chat_room_id: number;
  images: ChatMessageImage[];
  widget: ChatWidget | null;
  created_at: string;
}

export interface GetChatMessagesResponse {
  items: ChatMessage[];
  next_cursor: string | null;
}

// ── Cable events ──────────────────────────────────────────────────────────────

export type ResourceChannelEvent =
  | { type: "chat_room.created"; payload: ChatRoom }
  | { type: "notification.created"; payload: unknown };

export type RoomChannelEvent =
  | { type: "message.created"; payload: ChatMessage }
  | {
      type: "read";
      viewer: { type: string; id: number };
      last_read_at: string;
    };
