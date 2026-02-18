import { useState, useEffect, useRef, useCallback } from "react";

interface UseCountDownProps {
  seconds: number;
  autoStart?: boolean;
}

export const useCountDown = ({
  seconds: initialSeconds,
  autoStart = false,
}: UseCountDownProps) => {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isActive, setIsActive] = useState(autoStart);

  const endTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const start = useCallback(() => {
    endTimeRef.current = Date.now() + initialSeconds * 1000;
    setIsActive(true);
  }, [initialSeconds]);

  const pause = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const reset = useCallback(() => {
    pause();
    setSeconds(initialSeconds);
  }, [pause, initialSeconds]);

  useEffect(() => {
    if (!isActive) return;

    intervalRef.current = setInterval(() => {
      if (!endTimeRef.current) return;

      const remaining = Math.max(
        Math.floor((endTimeRef.current - Date.now()) / 1000),
        0,
      );

      setSeconds(remaining);

      if (remaining === 0) {
        pause();
      }
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, pause]);

  useEffect(() => {
    if (autoStart) {
      start();
    }
  }, [autoStart, start]);

  return { seconds, start, pause, reset, isActive };
};
