import authMiddleware from "../middlewares/authMiddleware";
import publicRoomController from "../controllers/publicRoomController";
import {body} from "express-validator";
import {getPublicRoomByID, getPublicRoomByName} from "../dao/publicRoomDAO";
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
        body('password').isLength({ max: 32}).withMessage("Некорректная длина пароля"),
        body('name').isLength({min: 5, max: 32}).withMessage("Некорректная длина названия").custom(value => {
            return getPublicRoomByName(value).then(room => {
                if (room === null) {
                    return Promise.reject('Не найдена группа с таким названием');
                }
            });
        }),
        publicRoomController.join);

    router.get('/public-rooms/rooms',
        authMiddleware, publicRoomController.getRooms);

    router.get('/public-room/rooms-messages',
        authMiddleware, publicRoomController.getRoomsWithMessages);

    router.get('/public-room/room-messages/:id',
        authMiddleware, publicRoomController.getRoomWithMessages);

    router.post('/public-room/room-messages/lazy/',
        authMiddleware,
        body('messagesLimit').custom(value=>{
            const n = Number(value)
            return !(isNaN(n) || n < 1 || n > 500);
        }).withMessage(`Максимальное количество сообщений ${500}, минимальное ${1}`),
        body('roomID').exists({checkNull:true}).withMessage(`roomID обязателен`).isLength({min: 24,max:24}).withMessage('Длина идентификатора 24 символа').custom(value => {
            return getPublicRoomByID(value).then(user => {
                if (user === null) {
                    return Promise.reject('Комната с таким roomID не найдена');
                }
            });
        }),
        publicRoomController.getRoomWithMessagesLazy);

    router.post('/public-rooms/rooms-messages/lazy',
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
                    const room = await getPublicRoomByID(id)
                    if (room === null)
                        return Promise.reject('Комната с таким id не найдена')
                }
                // return Promise.all(array.map(async (id:string)=>(await getMessageByID(id)) !=null))
            }),
        publicRoomController.getRoomsWithMessagesLazy)
}