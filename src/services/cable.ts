import { ActionCable, Cable } from "@kesha-antonov/react-native-action-cable";

const CABLE_URL = process.env.EXPO_PUBLIC_CABLE_URL;

export type CableStatus =
  | "disconnected"
  | "connecting"
  | "connected"
  | "reconnecting";

export interface CableSubscription<TMessage = unknown> {
  on(event: "message", handler: (data: TMessage) => void): void;
  send(data: { action?: string } & Record<string, unknown>): void;
  disconnect(): void;
}

export interface CableClient {
  subscribeTo<TMessage = unknown>(
    channel: string,
    params?: Record<string, unknown>,
  ): CableSubscription<TMessage>;
  disconnect(): void;
}

type ActiveSub = {
  key: string;
  channel: string;
  params?: Record<string, unknown>;
  handlers: ((data: unknown) => void)[];
  ch: ReturnType<InstanceType<typeof Cable>["setChannel"]> | null;
  refs: number;
};

type Consumer = ReturnType<typeof ActionCable.createConsumer>;

let actionCable: Consumer | null = null;
let cable: InstanceType<typeof Cable> | null = null;
let currentToken: string | null = null;
const activeSubs = new Map<string, ActiveSub>();

let status: CableStatus = "disconnected";
const statusListeners = new Set<(s: CableStatus) => void>();

function setStatus(next: CableStatus) {
  if (status === next) return;
  status = next;
  for (const l of statusListeners) l(status);
}

export function getCableStatus(): CableStatus {
  return status;
}

export function onCableStatus(listener: (s: CableStatus) => void): () => void {
  statusListeners.add(listener);
  listener(status);
  return () => {
    statusListeners.delete(listener);
  };
}

function stableStringify(v: unknown): string {
  if (v === null || typeof v !== "object") return JSON.stringify(v);
  if (Array.isArray(v)) return "[" + v.map(stableStringify).join(",") + "]";
  const obj = v as Record<string, unknown>;
  const keys = Object.keys(obj).sort();
  const body = keys
    .map((k) => JSON.stringify(k) + ":" + stableStringify(obj[k]))
    .join(",");
  return "{" + body + "}";
}

function keyOf(channel: string, params?: Record<string, unknown>): string {
  return params ? `${channel}|${stableStringify(params)}` : channel;
}

function attach(sub: ActiveSub) {
  if (!cable || !actionCable || sub.ch) return;
  sub.ch = cable.setChannel(
    sub.channel,
    actionCable.subscriptions.create({ channel: sub.channel, ...sub.params }),
  );
  sub.ch.on("received", (d: unknown) => {
    console.tron?.display?.({
      name: `WS ${sub.channel}`,
      value: d,
      preview: JSON.stringify(d).slice(0, 80),
    });
    console.log("[cable]", sub.channel, d);
  });
  for (const handler of sub.handlers) {
    sub.ch.on("received", handler);
  }
}

type ConnectionEvents = {
  open: () => void;
  close: (e: unknown) => void;
};

function bindTransportStatus(consumer: Consumer) {
  const conn = (
    consumer as unknown as { connection: { events: ConnectionEvents } }
  ).connection;
  const origOpen = conn.events.open;
  const origClose = conn.events.close;
  conn.events.open = () => {
    console.tron?.display?.({ name: "WS OPEN", value: {} });
    console.log("[cable] open");
    origOpen();
    if (actionCable === consumer) setStatus("connected");
  };
  conn.events.close = (e) => {
    console.tron?.display?.({ name: "WS CLOSE", value: e, important: true });
    console.log("[cable] close", e);
    origClose(e);
    if (actionCable === consumer) setStatus("reconnecting");
  };
}

function openTransport(url: string) {
  actionCable = ActionCable.createConsumer(url);
  cable = new Cable({});
  bindTransportStatus(actionCable);
  setStatus("connecting");
  for (const sub of activeSubs.values()) attach(sub);
}

function closeTransport() {
  for (const sub of activeSubs.values()) {
    sub.ch?.unsubscribe();
    sub.ch = null;
  }
  actionCable?.disconnect();
  actionCable = null;
  cable = null;
  setStatus("disconnected");
}

const client: CableClient = {
  subscribeTo<TMessage = unknown>(
    channel: string,
    params?: Record<string, unknown>,
  ): CableSubscription<TMessage> {
    const key = keyOf(channel, params);
    let sub = activeSubs.get(key);
    if (!sub) {
      sub = { key, channel, params, handlers: [], ch: null, refs: 0 };
      activeSubs.set(key, sub);
      attach(sub);
    }
    sub.refs++;
    const owned: ((data: unknown) => void)[] = [];

    return {
      on(_event, handler) {
        const h = handler as (data: unknown) => void;
        owned.push(h);
        sub!.handlers.push(h);
        sub!.ch?.on("received", h);
      },
      send(data) {
        sub!.ch?.perform(data.action ?? "receive", data);
      },
      disconnect() {
        for (const h of owned) {
          const i = sub!.handlers.indexOf(h);
          if (i !== -1) sub!.handlers.splice(i, 1);
        }
        owned.length = 0;
        sub!.refs--;
        if (sub!.refs <= 0) {
          sub!.ch?.unsubscribe();
          sub!.ch = null;
          activeSubs.delete(sub!.key);
        }
      },
    };
  },
  disconnect() {
    closeTransport();
    activeSubs.clear();
    currentToken = null;
  },
};

export function getCable(token: string | null): CableClient | null {
  if (!token || !CABLE_URL) {
    client.disconnect();
    return null;
  }

  if (currentToken === token && actionCable && cable) return client;

  closeTransport();
  openTransport(`${CABLE_URL}?token=${encodeURIComponent(token)}`);
  currentToken = token;
  return client;
}
