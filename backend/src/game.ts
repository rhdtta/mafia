import { Socket } from "socket.io";
import { Roles, Room } from "./utils/roomTypes";
import { outgoingMessage, supportedMessage } from "./utils/outgoingMessage";


export class Game {
    private room: Room;

    constructor(room: Room, socket: Socket) {
        this.room = room;

        this.designateRoles();
    }

    start() {
        this.dispatchRoles();

        // 1. Everyone is asleep (Send WS for everyone to sleep)
        // 2. Ask Mafia whom to kill? (Send and receive whom to KILL)
        // 3. Ask Doctor whom to save (same)
        // 4. Ask Police to check (same)
        // 5. Everyone wakes up and find (send ws to everyone that who has died {if all villagers are dead, MAFIAs won, if all mafias are dead, villagers win} else continue)
        // 6. Ask everyone to vote someone out (ws to everyone with a list)  {if all villagers are dead, MAFIAs won, if all mafias are dead, villagers win} else continue)
        // 7. Everyone go to sleep.... Repeat everything

    }

    broadcastMessage(message: outgoingMessage) {

    }

    designateRoles() {
        const len = this.room.participants.length;
        // if(len < 5) {
        //     throw new Error("Not enough participants!");
        // }

        // Mafia 
        while(1) {
            let random = this.random(len);
            if(this.room.participants[random].role == undefined) {
                this.room.participants[random].role = Roles.mafia;
                break;
            }
        } 

        // Doctor 
        while(1) {
            let random = this.random(len);
            if(this.room.participants[random].role == undefined) {
                this.room.participants[random].role = Roles.doctor;
                break;
            }
        } 

        // Police 
        while(1) {
            let random = this.random(len);
            if(this.room.participants[random].role == undefined) {
                this.room.participants[random].role = Roles.police;
                break;
            }
        } 

        // Villagers 
        this.room.participants.forEach((participant) => {
            if(participant.role == undefined) participant.role = Roles.villager;
        })
    }

    random(len: number) {
        return Math.floor(Math.random() * len)
    }

    dispatchRoles() {
        this.room.participants.forEach((i) => {
            if(i.role) {
                i.io.emit('role_assign', {
                    role: i.role
                })
            }
        })
    }

}