import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createCable } from "@anycable/web";
import Constants from "expo-constants";
import { useAppSelector } from "@/src/store/redux/store";

type Cable = ReturnType<typeof createCable>;

const AnyCableContext = createContext<Cable | null>(null);

export function AnyCableProvider({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((s) => s.auth.token);
  const cableUrl = Constants.expoConfig?.extra?.cableUrl as string | undefined;
  const [cable, setCable] = useState<Cable | null>(null);
  // Keep track of the current instance to disconnect it on cleanup
  const cableRef = useRef<Cable | null>(null);

  useEffect(() => {
    cableRef.current?.disconnect();

    if (!token || !cableUrl) {
      cableRef.current = null;
      setCable(null);
      return;
    }

    const instance = createCable(`${cableUrl}?token=${encodeURIComponent(token)}`);
    cableRef.current = instance;
    setCable(instance);

    return () => {
      instance.disconnect();
    };
  }, [token, cableUrl]);

  return (
    <AnyCableContext.Provider value={cable}>
      {children}
    </AnyCableContext.Provider>
  );
}

export const useAnyCable = () => useContext(AnyCableContext);
