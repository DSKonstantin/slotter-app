import { useGetChatRoomsInfiniteQuery } from "@/src/store/redux/services/api/chatRoomsApi";

export const useHasUnreadChat = (): boolean => {
  const { hasUnread } = useGetChatRoomsInfiniteQuery(
    {},
    {
      selectFromResult: ({ data }) => ({
        hasUnread:
          data?.pages.some((page) =>
            page.rooms.some((room) => room.unread_count > 0),
          ) ?? false,
      }),
    },
  );

  return hasUnread;
};
