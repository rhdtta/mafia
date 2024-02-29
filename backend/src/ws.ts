import { Server as HttpServer } from 'http'
import { Server, Socket } from 'socket.io'
import { RoomManager } from './RoomManager';

export const initWs = (http: HttpServer, roomManager: RoomManager) => {
    const server = new Server(http, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        }
    });

    server.on('connection', (socket: Socket) => {
        // save the participant to respective room
        // const roomId = socket.handshake.query.roomId;
        roomManager.addParticipant(socket);

        socketInitHandlers(socket);
    })

    function socketInitHandlers(socket: Socket) {
        socket.on('disconnect', () => {
            if(roomManager.getRoomId(socket.id)) {
                roomManager.removeParticipant
            }
        })


    }
}