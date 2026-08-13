import { WebSocketServer, type WebSocket } from "ws";

const server = new WebSocketServer({ port: 3002 });

type UserConnection = {
  id: string;
  socket: WebSocket;
};

const ROOMS: Record<string, UserConnection[]> = {};

server.on("connection", socket => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  socket.on("message", rawData => {
    let parsedData: { type?: string; boardId?: string };

    try {
      parsedData = JSON.parse(rawData.toString()) as { type?: string; boardId?: string };
    } catch (error) {
      console.warn("Ignoring non-JSON websocket message:", rawData.toString());
      return;
    }

    if (parsedData.type !== "join" || !parsedData.boardId) {
      return;
    }

    currentRoomId = parsedData.boardId;

    if (!ROOMS[currentRoomId]) {
      ROOMS[currentRoomId] = [];
    }

    const roomUsers = ROOMS[currentRoomId]!;
    currentUserId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const newUser = { id: currentUserId, socket };

    roomUsers.push(newUser);

    for (const user of roomUsers) {
      if (user.id === currentUserId) continue;

      user.socket.send(
        JSON.stringify({
          type: "join",
          userId: currentUserId,
        }),
      );
    }

    socket.send(
      JSON.stringify({
        type: "initial_state",
        users: roomUsers
          .filter(user => user.id !== currentUserId)
          .map(user => ({ id: user.id })),
      }),
    );
  });

  socket.on("close", () => {
    if (!currentRoomId || !currentUserId) return;

    const roomUsers = ROOMS[currentRoomId] ?? [];
    const remainingUsers = roomUsers.filter(user => user.id !== currentUserId);

    if (remainingUsers.length === 0) {
      delete ROOMS[currentRoomId];
      return;
    }

    ROOMS[currentRoomId] = remainingUsers;

    for (const user of remainingUsers) {
      user.socket.send(
        JSON.stringify({
          type: "leave",
          userId: currentUserId,
        }),
      );
    }
  });
});

console.log("WebSocket server running on ws://localhost:3002");