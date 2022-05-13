import {NextFunction, Request, Response, Router} from "express";
import {body} from "express-validator";
import {findUserByEmail, findUserByLogin} from "../dao/userDAO";
import userController from "../controllers/userController";
import authMiddleware from "../middlewares/authMiddleware";

const router = Router();

router.post('/auth/registration',
    body('email').exists().withMessage("email не указан").isEmail().withMessage("недопустимый формат email").custom((value) => {

        return findUserByEmail(value).then(user => {
            if (user !== null) {
                return Promise.reject('Такой E-mail уже используется');
            }
        });
    }),
    body('login').isLength({min: 5, max: 32}).withMessage("некорректная длина логина").custom(value => {
        return findUserByLogin(value).then(user => {
            if (user !== null) {
                return Promise.reject('Такой login уже используется');
            }
        });
    }),
    body('password').isLength({min: 5, max: 32}).withMessage("некорректная длина пароля"),
    body('confirmPassword').custom((value, {req }) => {
        if (value !== req.body.password) {
            throw new Error('Пароли не совпадают');
        }
        return true;
    }),
    userController.registration
);

router.post('/auth/login',
    body('email').exists().withMessage("email не указан").isEmail().withMessage("недопустимый формат email").custom((value) => {
        return findUserByEmail(value).then(user => {
            if (user === null) {
                return Promise.reject('Неправильный email или пароль');
            }
        });
    }),
    body('password').exists().withMessage("пароль не указан").isLength({min: 5, max: 32}).withMessage("некорректная длина пароля"),
    userController.login);
router.post('/auth/logout', authMiddleware, userController.logout);
router.post('/auth/user-data', authMiddleware, userController.getUserData);
router.get('/', (req: Request, res:Response, next: NextFunction)=>res.json("Get root!"));
export default router;