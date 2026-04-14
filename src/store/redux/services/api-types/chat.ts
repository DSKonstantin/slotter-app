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

export interface GetChatRoomsResponse {
  chat_rooms: ChatRoom[];
  total_unread_count: number;
}

// --- Messages ---

export interface ChatMessageUser {
  id: number;
  resource_type: "user" | "customer";
  name: string;
  avatar_url: string | null;
}

export interface ChatMessageFileUrl {
  id: string;
  url: string;
  content_type: string;
  filename: string;
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
  file_urls: ChatMessageFileUrl[];
  created_at: string;
  updated_at: string;
}

export interface GetChatMessagesResponse {
  chat_messages: ChatMessage[];
  total_count: number;
  unread_messages_count: number;
}

export interface CreateChatMessagePayload {
  body?: string;
  replied_to_id?: number;
}
