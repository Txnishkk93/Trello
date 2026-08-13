import { Socket } from "node:dgram";
import { join } from "node:path";
import { WebSocketServer } from "ws";

const server = new WebSocketServer({ port: 3002 });

const ROOMS: any = {

}

server.on("connection", (Socket) => {
    let joinedRoom = null;
    Socket.on("message", (data) => {
        const parsedData = JSON.parse(data);
        if (parsedData.type == "join") {
            joinedRoom = boardId;
            const boardId = parsedData.boardId;
            if (!ROOMS[boardId]) {
                ROOMS[boardId] = [];
            }
            const newUserId = Math.random();
            ROOMS[boardId].push({ userId: Math.random(), Socket: Socket })

            for (let i = 0; i < ROOMS[boardId].length; i++) {
                const user = ROOMS[boardId][i];
                user.Socket.send(JSON.stringify({
                    type: "join",
                    userId: newUserId,
                }))
            }

            Socket.send(JSON.stringify({
                type: "intial_state",
                users: ROOMS.filter(x => x.id != newUserId).map(u => u.id)
            }))
        }
    })
})

Socket.on("close", () => {
    Object.entries(ROOMS).map(([roomId, users]) => {
        const userExits = users.find(u => u.socket == socket);
        if (userExits) {
            users = users.filter(x => x.socket == socket);
            users.forEach(({ socket }) => socket.send(JSON.stringify({
                type: "leave",
                userId: userExits.id,
            })))
        }
    })
})