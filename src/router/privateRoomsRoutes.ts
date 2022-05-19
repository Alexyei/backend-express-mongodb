import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";
import privateRoomController from "../controllers/privateRoomController";
import {body} from "express-validator";
import {findUserByLogin} from "../dao/userDAO";

export default function addPrivateRoomsRouters(router:Router){
    router.post('/private-rooms/create',
        authMiddleware,
        body('login').isLength({min: 5, max: 32}).withMessage("Некорректная длина логина").custom(value => {
            return findUserByLogin(value).then(user => {
                if (user === null) {
                    return Promise.reject('Пользователь с таким логином не найден');
                }
            });
        }),
        privateRoomController.create)

    router.get('/private-rooms/rooms',
        authMiddleware,
        authMiddleware,privateRoomController.getRooms);

    router.get('/private-room/rooms-messages',
        authMiddleware,
        privateRoomController.getRoomsWithMessages)


    router.get('/private-room/room-messages/:id',
        authMiddleware,
        privateRoomController.getRoomWithMessages)
}