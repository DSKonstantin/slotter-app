import { toIMessage } from "@/src/utils/chat/toIMessage";
import type { ChatMessage } from "@/src/store/redux/services/api-types";

const baseMsg: ChatMessage = {
  id: 1,
  body: "hi",
  owner: {
    id: 7,
    type: "User",
    name: "Alice",
    avatar_url: null,
    avatar_blurhash: null,
  },
  chat_room_id: 3,
  images: [],
  chat_widget: null,
  reply_to: null,
  is_read: false,
  created_at: "2026-01-01T10:00:00.000Z",
};

describe("toIMessage", () => {
  it("maps a normal message owner to a gifted user", () => {
    const im = toIMessage(baseMsg);
    expect(im.user._id).toBe("user_7");
    expect(im.user.name).toBe("Alice");
  });

  it("falls back to a placeholder user when owner is null (deleted account) — #50", () => {
    const im = toIMessage({ ...baseMsg, owner: null });
    expect(im.user._id).toBe("deleted");
    expect(im.user.name).toBe("Удалённый пользователь");
  });

  it("handles a reply with a null owner without throwing — #50", () => {
    const im = toIMessage({
      ...baseMsg,
      reply_to: {
        id: 9,
        body: "quoted",
        created_at: "2026-01-01T09:00:00.000Z",
        owner: null,
      },
    });
    expect(im.reply_to?.user._id).toBe("deleted");
  });
});
