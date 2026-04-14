import { useEffect } from "react";
import { useAnyCable } from "@/src/contexts/AnyCableContext";
import { useAppDispatch } from "@/src/store/redux/store";
import { api } from "@/src/store/redux/services/api";

export function useChatRoomsIndexChannel() {
  const cable = useAnyCable();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!cable) return;

    const subscription = cable.subscribeTo("ChatRoomsIndexChannel");

    subscription.on("message", () => {
      dispatch(api.util.invalidateTags(["ChatRooms"]));
    });

    return () => subscription.disconnect();
  }, [cable, dispatch]);
}
