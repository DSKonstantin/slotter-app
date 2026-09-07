import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

export function useNow(intervalMs = 60_000): Date {
  const [now, setNow] = useState(() => new Date());

  const tick = useCallback(() => setNow(new Date()), []);

  useEffect(() => {
    const id = setInterval(tick, intervalMs);
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") tick();
    });

    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [intervalMs, tick]);

  return now;
}
