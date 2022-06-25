import {NextFunction, Request, Response} from "express";
import {validationResult} from "express-validator";
import ApiError from "../exceptions/ApiError";
import messageService from "../service/messageService";

class MessageController{
    async create(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }
            const {roomID, message } = req.body;
            const messageData = await messageService.create(roomID, req.session.userID as string, message);

            return res.json(messageData);
        } catch (error) {
            next(error);
        }
    }

    async lazy(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest(errors.array()[0].msg, errors.array()))
            }
            const {roomID, limit, from, nin } = req.body;
            const messageData = await messageService.lazy(roomID, req.session.userID as string,limit, from, nin);

            return res.json(messageData);
        } catch (error) {
            next(error);
        }
    }
}

export default new MessageController();