import { Socket } from "socket.io";
import { Roles, Room } from "./utils/roomTypes"
import { Game } from "./game";

export class RoomManager {
    private rooms: Map<string, Room> = new Map();
    private socketMap: Map<string, string> = new Map();

    createRoom = () => {
        // let id = (Math.random() + 1).toString(36).substring(7);
        let id = 'xl32j';
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
            isHead: !room?.participants.length? true: false,
            isDead: false
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

    initGame(socket: Socket) {
        const roomId = this.socketMap.get(socket.id);
        
        if(roomId) {
            const room = this.rooms.get(roomId);
            if(room) {
                const game = new Game(room, socket);

                game.start();
                game.dispatchSleep();
                game.dispatchMafia();

                this.setCallbacks(game);
    

            }
        } else {
            throw new Error('room not found')
        }
    }

    setCallbacks(game: Game) {
        const room = game.getRoom();
        room.participants.forEach((i) => {
            if(i.role === Roles.mafia) {
                i.io.on('mafia_reply', (data) => {
                    game.setWhomToKill(data);
                    game.dispatchDoctor();
                })
            } else if(i.role === Roles.doctor) {
                i.io.on('doctor_reply', (data) => {
                    console.log('i am here', data);
                    game.setWhomToSave(data);
                    game.dispatchPolice();
                })
            } else if(i.role === Roles.police) {
                i.io.on('police_reply', (data) => {
                    console.log('i am here', data);
                    game.setWhomToCheck(data, i.io);
                    game.dispatchIfSomeOneDied();
                })
            }
        })
    } 
}