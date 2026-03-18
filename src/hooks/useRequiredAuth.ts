import { useEffect } from "react";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";

export function useRequiredAuth(): { userId: number } | null {
  const userId = useAppSelector((s) => s.auth.user?.id);

  useEffect(() => {
    if (userId == null) router.replace(Routers.auth.root);
  }, [userId]);

  if (userId == null) return null;
  return { userId };
}
