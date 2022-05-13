import ApiError from "../exceptions/ApiError";
import {NextFunction, Request, Response} from "express";


export default function (req: Request, res:Response, next: NextFunction) {

    if (!req.session || !req.session.user) {
        next(ApiError.UnauthorizedError());
    }
    next();
}
