import { useEffect, useMemo, useState } from "react";

export const useCountdown = (initialSeconds: number) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(true);

  useEffect(() => {
    if (!isRunning) return;
    if (secondsLeft <= 0) return;

    const id = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearInterval(id);
  }, [isRunning, secondsLeft]);

  const restart = (newSeconds?: number) => {
    setSecondsLeft(newSeconds ?? initialSeconds);
    setIsRunning(true);
  };

  const formatted = useMemo(() => {
    const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
    const ss = String(secondsLeft % 60).padStart(2, "0");
    return `${mm}:${ss}`;
  }, [secondsLeft]);

  return {
    secondsLeft,
    formatted,
    restart,
    isFinished: secondsLeft === 0,
  };
};
