import express from 'express';
import cors from 'cors'
import {createServer} from 'http';
import server from 'socket.io';
import { initHttp } from './http';
import { RoomManager } from './RoomManager';
import { initWs } from './ws';

const app = express();
app.use(cors());
const httpServer = createServer(app);

const roomManager = new RoomManager();

initWs(httpServer, roomManager);
initHttp(app, roomManager);

httpServer.listen('3000', () => {
    console.log('Listening on 3000');
})
