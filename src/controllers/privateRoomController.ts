import ApiError from "../exceptions/ApiError";
import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import privateRoomService from "../service/privateRoomService";


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


}


export default new PrivateRoomController();
