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
