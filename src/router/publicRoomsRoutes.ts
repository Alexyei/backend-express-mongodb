import authMiddleware from "../middlewares/authMiddleware";
import publicRoomController from "../controllers/publicRoomController";
import {body} from "express-validator";
import {getPublicRoomByName} from "../dao/publicRoomDAO";
import {Router} from "express";

export default function publicRoomsRoutes(router: Router) {

    router.post('/public-rooms/create',
        authMiddleware,
        body('password').isLength({max: 32}).withMessage("Некорректная длина пароля"),
        body('name').isLength({min: 5, max: 32}).withMessage("Некорректная длина названия").custom(value => {
            return getPublicRoomByName(value).then(room => {
                if (room !== null) {
                    return Promise.reject('Такое название группы уже используется');
                }
            });
        }),
        publicRoomController.create);


    router.post('/public-rooms/join',
        authMiddleware,
        body('password').isLength({max: 32}).withMessage("Некорректная длина пароля"),
        body('name').isLength({min: 5, max: 32}).withMessage("Некорректная длина названия").custom(value => {
            return getPublicRoomByName(value).then(room => {
                if (room === null) {
                    return Promise.reject('Не найдена группа с таким названием');
                }
            });
        }),
        publicRoomController.join)
    router.get('/public-rooms/rooms',
        authMiddleware, publicRoomController.getRooms);
}