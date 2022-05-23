import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {body} from "express-validator";
import messageController from "../controllers/messageController";
import {getRoomByID} from "../dao/roomDAO";
import {getMessageByID} from "../dao/messageDAO";

export default function addMessageRouters(router:Router){
    if (process.env.NODE_ENV === 'test') {
        router.post('/messages/create',
            authMiddleware,
            body('message').isLength({min: 1, max: 5000}).withMessage(`Максимальная длина сообщения ${5000}`),
            body('roomID').exists({checkNull: true}).withMessage(`roomID обязателен`).isLength({
                min: 24,
                max: 24
            }).withMessage('Длина идентификатора 24 символа').custom(value => {
                return getRoomByID(value).then(user => {
                    if (user === null) {
                        return Promise.reject('Комната с таким roomID не найдена');
                    }
                });
            }),
            messageController.create)
    }

    router.post('/messages/lazy',
        authMiddleware,
        body('limit').custom(value=>{
            const n = Number(value)
            return !(isNaN(n) || n < 1 || n > 500);
        }).withMessage(`Максимальное количнство сообщений ${500}, минимальное ${1}`),
        body('roomID').exists({checkNull:true}).withMessage(`roomID обязателен`).isLength({min: 24,max:24}).withMessage('Длина идентификатора 24 символа').custom(value => {
            return getRoomByID(value).then(user => {
                if (user === null) {
                    return Promise.reject('Комната с таким roomID не найдена');
                }
            });
        }),
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
                    const message = await getMessageByID(id)
                    if (message === null)
                        return Promise.reject('Сообщение с таким id не найдено')
                }
                // return Promise.all(array.map(async (id:string)=>(await getMessageByID(id)) !=null))
            }),
        messageController.lazy)
}