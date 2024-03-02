import { Socket } from "socket.io"

export interface Participant {
    // name: string,
    id: string,
    io: Socket,
    isHead: false | true,
    role?: Roles,
    isDead: boolean 
}
export interface Room {
    id: string,
    participants: Participant[]
}

export enum Roles {
    mafia = "MAFIA",
    villager = "VILLAGER",
    doctor = "DOCTOR",
    police = "POLICE"
}