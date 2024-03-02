import { Socket } from "socket.io";
import { Participant, Roles, Room } from "./utils/roomTypes";
import { outgoingMessage, supportedMessage } from "./utils/outgoingMessage";


export class Game {
    private room: Room;
    private whomToKill: string = '';
    private whomToSave: string = '';
    private whomToCheck: string = '';
    private winner: string = '';

    setWhomToKill(whom: string) {
        this.whomToKill = whom;
    }
    setWhomToSave(whom: string) {
        this.whomToSave = whom;
    }
    setWhomToCheck(whom: string, socket: Socket) {
        this.whomToCheck = whom;

        this.room.participants.forEach((i) => {
            if(i.role === Roles.mafia && i.id === this.whomToCheck) {
                socket.emit('policeCheck', true);
                return;
            }
        })

        socket.emit('policeCheck', false)
    }

    getRoom() {
        return this.room
    }

    constructor(room: Room, socket: Socket) {
        this.room = room;
        
        this.designateRoles();
    }

    start() {
        // dispatch roles 
        this.dispatchRoles();

        // 1. Everyone is asleep (Send WS for everyone to sleep)

        // 2. Ask Mafia whom to kill? (Send and receive whom to KILL)
        // this.dispatchRoles()

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

    dispatchSleep() {
        this.room.participants.forEach((i) => {
            if(!i.isDead) {
                i.io.emit('sleep')
            }
        })
    }

    dispatchMafia() {
        const participantIds = this.room.participants.map((i) => {
            return i.id;
        })
        this.room.participants.forEach((i) => {
            if(i.role === Roles.mafia) {
                i.io.emit('killWhom', participantIds)
            } else {
                i.io.emit('mafia is killing')
            }
        })
    }

    dispatchDoctor() {
        const participantIds = this.room.participants.map((i) => {
            return i.id;
        })
        this.room.participants.forEach((i) => {
            if(i.role === Roles.doctor) {
                i.io.emit('saveWhom', participantIds)
            } else {
                i.io.emit('doctor is saving')
            }
        })
    }

    dispatchPolice() {
        const participantIds = this.room.participants.map((i) => {
            return i.id;
        })
        this.room.participants.forEach((i) => {
            if(i.role === Roles.police) {
                i.io.emit('checkWhom', participantIds)
            } else {
                i.io.emit('police is checking')
            }
        })
    }

    dispatchAwake() {
        this.room.participants.forEach((i) => {
            if(i.role) {
                i.io.emit('awake')
            }
        })
    }

    dispatchIfSomeOneDied() {
        if(this.whomToKill != '' && this.whomToSave != '') {
            // if no one died 
            if(this.whomToKill === this.whomToSave) {
                this.room.participants.forEach((i) => {
                    i.io.emit('noOneDied')
                })

                this.dispatchSurvey();
            } else {
                // diaptch who died 
                this.room.participants.forEach((i) => {
                    if(i.id === this.whomToKill) {
                        i.isDead = true;
                        i.io.emit('youAreDead')
                    } else {
                        i.io.emit('someoneDied', this.whomToKill)
                    }
                })

                this.dispatchIsGameOver();
            }


        } else {
            throw new Error('Something is wrong. Dead person data not found');
        }
    }

    // decideRound() {
    //     this.dispatchAwake();

    //     this.isGameOver() ? dispatchGameOver();

    //     if(this.whomToKill != this.whomToSave) {
    //         this.dispatchDead();
    //     } else{
    //         this.room.participants.forEach((i) => {
    //             if(i.role) {
    //                 i.io.emit('no one died')
    //             }
    //         }) 
    //     }

    // }

    dispatchGameOver(who: Roles) {
        this.room.participants.forEach((i) => {
            i.io.emit('gameOver', who)
        })
    }

    dispatchIsGameOver() {
        let mafia, police, doctor;
        this.room.participants.forEach((i) => {
            if(i.isDead) {
                if(i.role === Roles.mafia) mafia = true;
                else if(i.role === Roles.doctor) doctor = true;
                else if(i.role === Roles.police) police = true;
            }
        })

        // decide if game is over 
        if(mafia) {
            this.winner = Roles.villager;
            this.dispatchGameOver(Roles.villager);
        } else if(police && doctor) {
            this.winner = Roles.mafia;
            this.dispatchGameOver(Roles.mafia);
        }
    }

    dispatchSurvey() {
        const participantIds = this.room.participants.map((i) => {
            return i.id;
        })
        this.room.participants.forEach((i) => {
            i.io.emit('voteOutWhom', participantIds)
        })
    }

}