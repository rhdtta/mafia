import { Socket } from "socket.io";
import { Room } from "./utils/roomTypes"
import { Game } from "./game";

export class RoomManager {
    private rooms: Map<string, Room> = new Map();
    private socketMap: Map<string, string> = new Map();

    createRoom = () => {
        let id = (Math.random() + 1).toString(36).substring(7);
        this.rooms.set(id, {
            id,
            participants: []
        });

        return id;
    } 

    addParticipant(id:string, socket: Socket) {
        let room = this.rooms.get(id);
        if(!room) {
            socket.disconnect()
        }
        
        let participant = {
            // name: socket.handshake.query.name as string,
            id: (Math.random() + 1).toString(36).substring(7),
            io: socket,
            isHead: !room?.participants.length? true: false
        }

        if(room) {
            // add a new participant 
            room.participants.push(participant);
            
            // store the socket id and its corresponding room
            this.socketMap.set(socket.id, id);
        } 

        return participant.id;
    }


    canAddToRoom (id: string) {
        return this.rooms.get(id)? true: false;
    }

    removeParticipantFromRoom(socketId: string) {
        const roomId = this.socketMap.get(socketId);
        if(roomId) {
            let room = this.rooms.get(roomId);

            if(room) {
                room.participants = room.participants.filter((participant) => {
                    return participant.io.id != socketId;
                })

                this.socketMap.delete(socketId);

                if(room.participants.length == 0) {
                    this.rooms.delete(roomId)
                }
            }

        }
    }

    startGame(socket: Socket) {
        const roomId = this.socketMap.get(socket.id);
        
        console.log(roomId)
        if(roomId) {
            const room = this.rooms.get(roomId);
            if(room) {
                const game = new Game(room, socket);
                game.start();
            }
        }
    }


    
}