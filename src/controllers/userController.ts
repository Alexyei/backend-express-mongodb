import ApiError from "../exceptions/ApiError";
import config from "../config/default"


import {NextFunction, Request, Response} from "express";

import {validationResult} from "express-validator";
import userService from "../service/userService";


class UserController {
    async registration(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, login, password } = req.body;
            const userData = await userService.registration(email, login, password);

            return res.json(userData);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }

            const {email, password} = req.body;
            const userData = await userService.login(email, password);
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }
}

export default new UserController();