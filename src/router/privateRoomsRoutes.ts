import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";
import privateRoomController from "../controllers/privateRoomController";
import {body, param} from "express-validator";
import {findUserByID, findUserByLogin} from "../dao/userDAO";
import {getPublicRoomByID} from "../dao/publicRoomDAO";
import publicRoomController from "../controllers/publicRoomController";
import {getPrivateRoomByID} from "../dao/privateRoomDAO";
import ApiError from "../exceptions/ApiError";


const UserLoginExistBodyValidator = (value:string) => {
    return findUserByLogin(value).then(user => {
        if (user === null) {
            return Promise.reject('Пользователь с таким логином не найден');
        }
    });}

const AnotherUserIDBodyValidator = (value:string) => {
    return findUserByID(value).then(user => {
        if (user === null) {
            return Promise.reject('Пользователь с таким anotherUserID не найден');
        }
    })}

const checkIdNotEmptyParamValidator = (id:string)=>{
    if (!id)
        return false
}

const checkMessagesLimitBodyValidator = (value:string)=>{
    const n = Number(value)
    return !(isNaN(n) || n < 1 || n > 500);
}

const checkRoomsLimitBodyValidator = (value:string)=>{
    const n = Number(value)
    return !(isNaN(n) || n < 1 || n > 50);
}

const checkDateFormatBodyValidator = (value:string)=>{
    return (new Date(value)).getTime() > 0
}

const checkOnlyIDsInArrayBodyValidator = (array:any[])=>{
    return array.every((el: any) => (typeof el === 'string') && el.length == 24)}

const checkAllPrivateRoomsExistBodyValidator = async (array:any[])=>{
    for(const id of array){
        const room = await getPrivateRoomByID(id)
        if (room === null)
            return Promise.reject('Комната с таким id не найдена')
    }
}

const privateRoomCreateValidationSchema = body('login').isLength({min: 5, max: 32}).withMessage("Некорректная длина логина").custom(UserLoginExistBodyValidator);
const privateRoomGetValidationSchema = param('id').custom(checkIdNotEmptyParamValidator).withMessage('Некорректный id комнаты!');
const privateRoomGetLazyValidationSchema = [body('messagesLimit').custom(checkMessagesLimitBodyValidator).withMessage(`Максимальное количество сообщений ${500}, минимальное ${1}`),
    body('anotherUserID').exists({checkNull:true}).withMessage(`anotherUserID обязателен`).isLength({min: 24,max:24}).withMessage('Длина идентификатора 24 символа').custom(AnotherUserIDBodyValidator)]
const privateRoomsGetLazyValidationSchema = [body('roomsLimit').custom(checkRoomsLimitBodyValidator).withMessage(`Максимальное количество комнат ${50}, минимальное ${1}`),
    body('messagesLimit').custom(checkMessagesLimitBodyValidator).withMessage(`Максимальное количество сообщений ${500}, минимальное ${1}`),
    body('from').isLength({min:24, max: 24}).withMessage(`Метка времени должна содержать 24 символов`).
    custom(checkDateFormatBodyValidator).withMessage('Требуемый формат метки времени (.toISOString): 2022-05-16T16:11:38.537Z'),
    body('nin')
        .isArray().withMessage('Поле nin не является массивом')
        .custom(checkOnlyIDsInArrayBodyValidator)
        .withMessage('Поле nin должно содержать только идентификаторы')
        .custom(checkAllPrivateRoomsExistBodyValidator)]



export default function addPrivateRoomsRouters(router:Router){
    router.post('/private-rooms/create',
        authMiddleware,
        privateRoomCreateValidationSchema,
        privateRoomController.create)

    router.get('/private-rooms/rooms',
        authMiddleware,privateRoomController.getRooms);

    router.get('/private-room/rooms-messages',
        authMiddleware,
        privateRoomController.getRoomsWithMessages)


    router.get('/private-room/room-messages/:id',
        authMiddleware,
        privateRoomGetValidationSchema,
        privateRoomController.getRoomWithMessages)

    router.post('/private-room/room-messages/lazy/',
        authMiddleware,
        privateRoomGetLazyValidationSchema,
        privateRoomController.getRoomWithMessagesLazy);

    router.post('/private-rooms/rooms-messages/lazy',
        authMiddleware,
        checkAllPrivateRoomsExistBodyValidator,
        privateRoomController.getRoomsWithMessagesLazy)
}
