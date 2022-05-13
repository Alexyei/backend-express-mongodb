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

            req.session.user = userData
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

            req.session.user = userData
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req: Request, res:Response, next: NextFunction) {
        try {

            req.session.destroy((err) => {
                res.redirect(config.app.client_url) // will always fire after session is destroyed
            })
        } catch (e) {
            next(e);
        }
    }

    getUserData(req: Request, res:Response, next: NextFunction) {
        return res.json(req.session.user);
    }
}

export default new UserController();