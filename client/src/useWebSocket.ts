import { useCallback, useEffect, useRef, useState } from "react";
import type { ServerMessage } from "./types";

const WS_URL = "ws://localhost:8001";
const RECONNECT_DELAY = 2000;

export function useWebSocket(onMessage: (msg: ServerMessage) => void) {
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const reconnectTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data) as ServerMessage;
          onMessageRef.current(data);
        } catch {
          // ignore malformed messages
        }
      };

      ws.onclose = () => {
        setConnected(false);
        wsRef.current = null;
        reconnectTimer.current = window.setTimeout(connect, RECONNECT_DELAY);
      };

      ws.onerror = () => ws.close();
    }

    connect();

    return () => {
      clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, []);

  const sendMessage = useCallback((data: object) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    }
  }, []);

  return { connected, sendMessage };
}
