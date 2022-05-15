import ApiError from "../exceptions/ApiError";
import config from "../config/default"


import {NextFunction, Request, Response} from "express";

import {validationResult} from "express-validator";
import userService from "../service/userService";
import sessionService from "../service/sessionService";


class UserController {
    async registration(req: Request, res:Response, next: NextFunction) {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return next(ApiError.BadRequest('Ошибка при валидации', errors.array()))
            }
            const {email, login, password } = req.body;
            const userData = await userService.registration(email, login, password);

            // req.session.user = userData
            await sessionService.add(req, userData)
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

            // req.session.user = userData
            await sessionService.add(req, userData)
            return res.json(userData);
        } catch (e) {
            next(e);
        }
    }

    async logout(req: Request, res:Response, next: NextFunction) {
        try {

            sessionService.remove(req,true, (err)=>{
                res.redirect(config.app.client_url) // will always fire after session is destroyed
            })
            // req.session.destroy((err) => {
            //     res.redirect(config.app.client_url) // will always fire after session is destroyed
            // })
        } catch (e) {
            next(e);
        }
    }

    async clearSession(req: Request, res:Response, next: NextFunction) {
        try {

            sessionService.clear(req.session.userID)
            // req.session.destroy((err) => {
            //     res.redirect(config.app.client_url) // will always fire after session is destroyed
            // })
            res.json("Вы вышли со всех устройств!")
        } catch (e) {
            next(e);
        }
    }

    async getUserData(req: Request, res:Response, next: NextFunction) {
        // return res.json(req.session.user);
        return res.json(await sessionService.getUserData(req));
    }
}

export default new UserController();