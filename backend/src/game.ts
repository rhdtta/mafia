import { Socket } from "socket.io";
import { Room } from "./utils/roomTypes";

export class Game {
    private room: Room;

    constructor(room: Room, socket: Socket) {
        this.room = room;

        this.initGame();
    }

    initGame() {
        this.broadcastMessage(room)
    }

    broadcastMessage() {

    }

}