import {Router} from "express";
import authMiddleware from "../middlewares/authMiddleware";
import {body} from "express-validator";
import messageController from "../controllers/messageController";

export default function addMessageRouters(router:Router){
    router.post('/messages/create',
        authMiddleware,
        body('message').isLength({min: 1, max: 5000}).withMessage(`Максимальная длина сообщения ${5000}`),
        body('roomID').exists({checkNull:true}).withMessage(`Максимальная длина сообщения ${5000}`),
        messageController.create)
}