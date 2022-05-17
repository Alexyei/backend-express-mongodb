import ApiError from "../exceptions/ApiError";


import {NextFunction, Request, Response} from "express";

import {validationResult} from "express-validator";
import publicRoomService from "../service/publicRoomService";

class PublicRoomController {
    async create(req: Request, res:Response, next: NextFunction) {

        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }

            const {name, password } = req.body;

            // 20 - это длина идентификатора socketio
            // в socket-io мы подключаемся по названию комнаты
            // если мы "случайно" назовём комнату как id, то к комнате будет автоматически подключен пользователь с таким socket-id (который может и не являться участником комнаты)
            // 24 - это длина идентификатора mongodb
            // В приватных чатах мы подключаемся по id приватной комнаты
            // Если мы назовём публичную комнату как id приватной комнаты, то мы будем получать сообщения из приватной комнаты, что недопустимо
            if (name.length === 20 || name.length === 24)
                return next(ApiError.BadRequest("Название комнаты не может содержать ровно 20 или 24 символа"))

            const roomData = await publicRoomService.create(name, password, req.session.userID as string);


            return res.json(roomData);
        } catch (error) {
            next(error);
        }
    }

    async join(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }
            const {name, password} = req.body;
            const roomData = await publicRoomService.join(name, password, req.session.userID as string);

            return res.json(roomData);
        } catch (e) {
            next(e);
        }
    }

    async getRooms(req: Request, res:Response, next: NextFunction) {
        try {
            const rooms = await publicRoomService.getUserRooms(req.session.userID as string);

            return res.json(rooms);
        } catch (e) {
            next(e);
        }
    }
}

export default new PublicRoomController();
