import { useSegments } from "expo-router";

const ROOT_HIDDEN_SEGMENTS = ["chat", "payment"];

const BROADCAST_FORM_SEGMENTS = ["create", "[id]"];

export function shouldShowTabBar(segments: string[]): boolean {
  if (ROOT_HIDDEN_SEGMENTS.includes(segments[1])) return false;

  const lastSegment = segments[segments.length - 1];
  const isBroadcastForm =
    segments.includes("broadcast") &&
    BROADCAST_FORM_SEGMENTS.includes(lastSegment);

  return !isBroadcastForm;
}

export function useShowTabBar(): boolean {
  const segments = useSegments() as string[];
  return shouldShowTabBar(segments);
}
