export interface ChatRoomTag {
  id: number;
  name: string;
  color: string;
}

export interface ChatRoomMember {
  id: number;
  name: string;
  avatar_url: string | null;
  tag: ChatRoomTag | null;
}

export interface ChatLastMessage {
  id: number;
  body: string | null;
  created_at: string;
  is_mine: boolean;
  status: "read" | "unread";
}

export interface ChatRoom {
  id: number;
  other_member: ChatRoomMember;
  last_message: ChatLastMessage | null;
  unread_count: number;
  created_at: string;
}

export type GetChatRoomsParams = {
  page?: number;
  per_page?: number;
  search?: string;
  tag_id?: number;
};

export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

export interface GetChatRoomsResponse {
  chat_rooms: ChatRoom[];
  pagination: PaginationMeta;
  total_unread_count: number;
}

// --- Messages ---

export interface ChatMessageUser {
  id: number;
  resource_type: "user" | "customer";
  name: string;
  avatar_url: string | null;
}

export interface ChatMessageImageUrl {
  id: string;
  url: string;
  content_type: string;
  filename: string;
}

export interface ChatWidgetAppointmentService {
  id: number;
  name: string;
  duration: number;
  price_cents: number;
}

export interface ChatMessageWidgetAppointment {
  id: number;
  type: "Appointment";
  status: string;
  start_time: string;
  end_time: string;
  date: string;
  duration: number;
  price_cents: number;
  price_currency: string;
  payment_method: string;
  comment: string | null;
  cancel_reason: string | null;
  send_notification: boolean;
  public_token: string;
  customer_confirmed_at: string | null;
  customer: {
    id: number;
    name: string;
    avatar_url: string | null;
  } | null;
  services: ChatWidgetAppointmentService[];
  additional_services: ChatWidgetAppointmentService[];
  user?: {
    id: number;
    first_name: string;
    last_name: string;
    avatar_url: string | null;
  };
}

export interface ChatMessage {
  id: number;
  body: string | null;
  decorated_body: string | null;
  type_of: "normal" | "system";
  status: "read" | "unread";
  user: ChatMessageUser;
  chat_room_id: number;
  replied_to_id: number | null;
  reply_to: ChatMessage | null;
  image_urls: ChatMessageImageUrl[];
  appointment?: ChatMessageWidgetAppointment | null;
  created_at: string;
  updated_at: string;
}

export interface GetChatMessagesResponse {
  chat_messages: ChatMessage[];
  total_count: number;
  unread_messages_count: number;
}
