import ApiError from "../exceptions/ApiError";
import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import privateRoomService from "../service/privateRoomService";
import publicRoomService from "../service/publicRoomService";


class PrivateRoomController {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }

            const {login} = req.body;

            const room = await privateRoomService.createOrOpen(login, req.session.userID as string)
            return res.json(room);


        } catch (error) {
            next(error);
        }
    }

    async getRooms(req: Request, res: Response, next: NextFunction) {
        try {
            const rooms = await privateRoomService.getUserPrivateRoomsWithLeaveUsers(req.session.userID as string);

            return res.json(rooms);
        } catch (e) {
            next(e);
        }
    }


    async getRoomsWithMessages(req: Request, res:Response, next: NextFunction) {
        try {
            const rooms = await privateRoomService.getUserPrivateRoomsWithMessages(req.session.userID as string);

            return res.json(rooms);
        } catch (e) {
            next(e);
        }
    }

    async getRoomWithMessages(req: Request, res:Response, next: NextFunction) {
        try {
            const id = req.params.id;
            if (!id)
                return next(ApiError.BadRequest('Некорректный id комнаты!'))

            const room = await privateRoomService.getUserPrivateRoomWithMessagesByID(id, req.session.userID as string);

            return res.json(room);
        } catch (e) {
            next(e);
        }
    }


    async getRoomsWithMessagesLazy(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }
            const {messagesLimit, roomsLimit, from, nin} = req.body;

            const room = await privateRoomService.getUserPrivateRoomsWithMessagesLazy(req.session.userID as string, roomsLimit, messagesLimit,from,nin);

            return res.json(room);
        } catch (e) {
            next(e);
        }
    }


    async getRoomWithMessagesLazy(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }
            const {anotherUserID, messagesLimit} = req.body;

            const room = await privateRoomService.getUserPrivateRoomWithMessagesLazy(anotherUserID, req.session.userID as string, messagesLimit);

            return res.json(room);
        } catch (e) {
            next(e);
        }
    }

}


export default new PrivateRoomController();
