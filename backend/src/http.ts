import express, {Express} from 'express';
import { RoomManager } from './RoomManager';

export const initHttp = (app: Express, roomManager: RoomManager) => {
    app.use(express.json());
    app.post('/createRoom', (req, res) => {
        const createdRoom = roomManager.createRoom();
        res.status(200).send({id: createdRoom});
    })

    app.get('/canEnterRoom', (req, res) => {
        const id = req.body.id;
        roomManager.canAddToRoom(id)? res.sendStatus(200): res.sendStatus(400);
    })
}