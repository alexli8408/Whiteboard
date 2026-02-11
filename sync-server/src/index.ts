import "dotenv/config";
import http from "node:http";
import { WebSocketServer, WebSocket } from "ws";
import { TLSocketRoom, InMemorySyncStorage } from "@tldraw/sync-core";

const PORT = parseInt(process.env.PORT || "5858");
const CORS_ORIGIN = process.env.CORS_ORIGIN || "http://localhost:3000";

// Map of boardId -> TLSocketRoom
const rooms = new Map<string, TLSocketRoom<any>>();

// Cleanup idle rooms after 10 minutes of no connections
const ROOM_IDLE_TIMEOUT = 10 * 60 * 1000;
const roomTimers = new Map<string, ReturnType<typeof setTimeout>>();

function getOrCreateRoom(boardId: string): TLSocketRoom<any> {
  let room = rooms.get(boardId);
  if (room && !room.isClosed()) {
    // Clear any pending cleanup timer
    const timer = roomTimers.get(boardId);
    if (timer) {
      clearTimeout(timer);
      roomTimers.delete(boardId);
    }
    return room;
  }

  room = new TLSocketRoom({
    storage: new InMemorySyncStorage(),
    log: {
      warn: (...args: unknown[]) => console.warn(`[${boardId}]`, ...args),
      error: (...args: unknown[]) => console.error(`[${boardId}]`, ...args),
    },
    onSessionRemoved: (_room, { numSessionsRemaining }) => {
      if (numSessionsRemaining === 0) {
        // Schedule cleanup
        const timer = setTimeout(() => {
          console.log(`Closing idle room: ${boardId}`);
          const r = rooms.get(boardId);
          if (r) {
            r.close();
            rooms.delete(boardId);
            roomTimers.delete(boardId);
          }
        }, ROOM_IDLE_TIMEOUT);
        roomTimers.set(boardId, timer);
      }
    },
  });

  rooms.set(boardId, room);
  console.log(`Created room: ${boardId} (${rooms.size} total)`);
  return room;
}

// HTTP server for health checks and WebSocket upgrade
const server = http.createServer((req, res) => {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", CORS_ORIGIN);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", rooms: rooms.size }));
    return;
  }

  res.writeHead(404);
  res.end("Not found");
});

// WebSocket server
const wss = new WebSocketServer({ server });

wss.on("connection", (ws: WebSocket, req: http.IncomingMessage) => {
  // Extract boardId from URL: /board/<boardId>
  const url = new URL(req.url || "/", `http://${req.headers.host}`);
  const pathParts = url.pathname.split("/").filter(Boolean);

  // Expect /board/<boardId>
  if (pathParts.length < 2 || pathParts[0] !== "board") {
    ws.close(4000, "Invalid path. Use /board/<boardId>");
    return;
  }

  const boardId = pathParts[1];
  const sessionId = crypto.randomUUID();

  console.log(`Client connected: ${sessionId} -> room ${boardId}`);

  const room = getOrCreateRoom(boardId);

  room.handleSocketConnect({
    sessionId,
    socket: ws,
  });
});

server.listen(PORT, () => {
  console.log(`Sync server running on http://localhost:${PORT}`);
  console.log(`CORS origin: ${CORS_ORIGIN}`);
});
