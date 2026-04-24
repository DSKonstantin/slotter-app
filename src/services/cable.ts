import { createCable } from "@anycable/web";

export type Cable = ReturnType<typeof createCable>;

const CABLE_URL = process.env.EXPO_PUBLIC_CABLE_URL;

let currentCable: Cable | null = null;
let currentToken: string | null = null;

export function getCable(token: string | null): Cable | null {
  if (!token || !CABLE_URL) {
    if (currentCable) {
      currentCable.disconnect();
      currentCable = null;
      currentToken = null;
    }
    return null;
  }

  if (currentToken === token && currentCable) {
    return currentCable;
  }

  if (currentCable) {
    currentCable.disconnect();
  }

  currentCable = createCable(
    `${CABLE_URL}?token=${encodeURIComponent(token)}`,
    { protocol: "actioncable-v1-json" },
  );
  currentToken = token;

  return currentCable;
}
