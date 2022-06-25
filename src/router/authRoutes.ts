import {Router} from "express";
import {body} from "express-validator";
import {findUserByEmail, findUserByLogin} from "../dao/userDAO";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";
import sessionAuthLimitService from "../service/sessionAuthLimitService";
import config from "../config/default"

export default function addAuthRoutes(router:Router){
    router.post('/auth/registration',
        body('email').exists().withMessage("Email не указан").isEmail().withMessage("Недопустимый формат email").custom((value) => {

            return findUserByEmail(value).then(user => {
                if (user !== null) {
                    return Promise.reject('Такой E-mail уже используется');
                }
            });
        }),
        body('login').isLength({min: 5, max: 32}).withMessage("Некорректная длина логина").custom(value => {
            return findUserByLogin(value).then(user => {
                if (user !== null) {
                    return Promise.reject('Такой login уже используется');
                }
            });
        }),
        body('password').isLength({min: 5, max: 32}).withMessage("Некорректная длина пароля"),
        body('confirmPassword').custom((value, {req }) => {
            if (value !== req.body.password) {
                throw new Error('Пароли не совпадают');
            }
            return true;
        }),
        userController.registration
    );

    router.post('/auth/login',
        body('email').exists().withMessage("Email не указан").isEmail().withMessage("Недопустимый формат email").custom((value) => {
            return findUserByEmail(value).then(user => {
                if (user === null) {
                    return Promise.reject('Неправильный email или пароль');
                }
            });
        })
            .custom((value)=>{
            return sessionAuthLimitService.getUserData(value).then(data=>{
                if (data && data.blocked && (new Date() < new Date(data.blocked)))
                {
                    return Promise.reject(`Достигнут лимит поптыок входа, блокировка авторизации на ${config.userLimits.auth.blockTimeMinutes} минут`);
                }
            })
        }),
        body('password').exists().withMessage("пароль не указан").isLength({min: 5, max: 32}).withMessage("Некорректная длина пароля"),
        userController.login);
    router.post('/auth/logout', authMiddleware, userController.logout);
    router.post('/auth/clear', authMiddleware, userController.clearSession);
    router.post('/auth/user-data', authMiddleware, userController.getUserData);
}