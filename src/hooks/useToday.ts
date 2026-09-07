import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

const startOfDay = (d: Date): Date =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate());

const msUntilNextMidnight = (now: Date): number => {
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return next.getTime() - now.getTime();
};

export function useToday(): Date {
  const [today, setToday] = useState(() => startOfDay(new Date()));

  const sync = useCallback(() => {
    setToday((prev) => {
      const next = startOfDay(new Date());
      return next.getTime() === prev.getTime() ? prev : next;
    });
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") sync();
    });
    return () => sub.remove();
  }, [sync]);

  useEffect(() => {
    const timer = setTimeout(sync, msUntilNextMidnight(new Date()) + 1_000);
    return () => clearTimeout(timer);
  }, [today, sync]);

  return today;
}
