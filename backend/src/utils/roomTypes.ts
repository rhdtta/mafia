import { Socket } from "socket.io"

export interface Participant {
    // name: string,
    id: string,
    io: Socket,
    isHead: false | true;
}
export interface Room {
    id: string,
    participants: Participant[]
}