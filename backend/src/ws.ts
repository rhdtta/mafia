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
        const roomId = socket.handshake.query.roomId as string;
        const userId = roomManager.addParticipant(roomId, socket);
        
        socket.emit('participantAdded', userId);

        socketInitHandlers(socket);
    })

    function socketInitHandlers(socket: Socket) {
        socket.on('disconnect', () => {
            roomManager.removeParticipantFromRoom(socket.id);
        })

        socket.on('startGame', () => {
            roomManager.startGame(socket)
        })


    }
}