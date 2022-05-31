import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";
import privateRoomController from "../controllers/privateRoomController";
import {body} from "express-validator";
import {findUserByID, findUserByLogin} from "../dao/userDAO";
import {getPublicRoomByID} from "../dao/publicRoomDAO";
import publicRoomController from "../controllers/publicRoomController";
import {getPrivateRoomByID} from "../dao/privateRoomDAO";

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

    router.post('/private-room/room-messages/lazy/',
        authMiddleware,
        body('messagesLimit').custom(value=>{
            const n = Number(value)
            return !(isNaN(n) || n < 1 || n > 500);
        }).withMessage(`Максимальное количество сообщений ${500}, минимальное ${1}`),
        body('anotherUserID').exists({checkNull:true}).withMessage(`anotherUserID обязателен`).isLength({min: 24,max:24}).withMessage('Длина идентификатора 24 символа').custom(value => {
            return findUserByID(value).then(user => {
                if (user === null) {
                    return Promise.reject('Пользователь с таким anotherUserID не найден');
                }
            });
        }),
        privateRoomController.getRoomWithMessagesLazy);

    router.post('/private-rooms/rooms-messages/lazy',
        authMiddleware,
        body('roomsLimit').custom(value=>{
            const n = Number(value)
            return !(isNaN(n) || n < 1 || n > 50);
        }).withMessage(`Максимальное количество комнат ${50}, минимальное ${1}`),
        body('messagesLimit').custom(value=>{
            const n = Number(value)
            return !(isNaN(n) || n < 1 || n > 500);
        }).withMessage(`Максимальное количество сообщений ${500}, минимальное ${1}`),
        body('from').isLength({min:24, max: 24}).withMessage(`Метка времени должна содержать 24 символов`).
        custom(value=>{
            return (new Date(value)).getTime() > 0
        }).withMessage('Требуемый формат метки времени (.toISOString): 2022-05-16T16:11:38.537Z'),
        body('nin')
            .isArray().withMessage('Поле nin не является массивом')
            .custom((array)=>{
                return array.every((el: any) => (typeof el === 'string') && el.length == 24)})
            .withMessage('Поле nin должно содержать только идентификаторы')
            .custom(async (array)=>{
                for(const id of array){
                    const room = await getPrivateRoomByID(id)
                    if (room === null)
                        return Promise.reject('Комната с таким id не найдена')
                }
                // return Promise.all(array.map(async (id:string)=>(await getMessageByID(id)) !=null))
            }),
        privateRoomController.getRoomsWithMessagesLazy)
}