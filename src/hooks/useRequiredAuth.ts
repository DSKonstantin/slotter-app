import { useEffect } from "react";
import { router } from "expo-router";
import { Routers } from "@/src/constants/routers";
import { useAppSelector } from "@/src/store/redux/store";

export function useRequiredAuth(): { userId: number } | null {
  const userId = useAppSelector((s) => s.auth.user?.id);
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    if (status === "unauthenticated") router.replace(Routers.auth.root);
  }, [status]);

  if (userId == null) return null;
  return { userId };
}
