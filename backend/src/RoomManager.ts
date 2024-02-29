import { Socket } from "socket.io";
import { Room } from "./utils/roomTypes"

export class RoomManager {
    private rooms: Map<string, Room> = new Map();
    private socketMap: Map<string, string> = new Map();

    createRoom = () => {
        let id = (Math.random() + 1).toString(36).substring(7)
        this.rooms.set(id, {
            id,
            participants: []
        });

        return id;
    } 

    addParticipant(socket: Socket) {
        let room = this.rooms.get(socket.handshake.query.roomId as string);
        let participant = {
            name: socket.handshake.query.name as string,
            id: (Math.random() + 1).toString(36).substring(7),
            io: socket,
            isHead: socket.handshake.query.isHead? true: false
        }

        if(room) {
            // add a new participant 
            room.participants.push(participant);
            
            // store the socket id and its corresponding room 
            this.socketMap.set(socket.id, room.id);
        } 
    }

    removeParticipant(socket: Socket) {
        let room = this.rooms.get(socket.handshake.query.roomId as string);
        let participant = {
            name: socket.handshake.query.name,
            id: (Math.random() + 1).toString(36).substring(7),
            io: socket,
            isHead: socket.handshake.query.isHead? true: false
        }
        room?.participants.push()
    }

    canAddToRoom (id: string) {
        return this.rooms.get(id)? true: false;
    }

    getRoomId(socketId: string) {
        if(this.socketMap.get(socketId)) return this.socketMap.get(socketId);
    }
    
}