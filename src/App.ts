import express from "express";
import config from './config/default'
import connectDB from "./db/connect";
import errorMiddleware from "./middlewares/errorMiddleware";
import {body} from "express-validator";
import {findUserByEmail, findUserByLogin} from "./dao/userDAO";
import userController from "./controllers/userController";


const PORT = config.app.port;
const HOST = config.app.host;


const app = express()
app.use(express.json())
app.post('/auth/registration',
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

app.post('/auth/login',
    body('email').exists().withMessage("email не указан").isEmail().withMessage("недопустимый формат email").custom((value) => {
        return findUserByEmail(value).then(user => {
            if (user === null) {
                return Promise.reject('Неправильный email или пароль');
            }
        });
    }),
    body('password').exists().withMessage("пароль не указан").isLength({min: 5, max: 32}).withMessage("некорректная длина пароля"),
    userController.login);

app.use(errorMiddleware);

connectDB().then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`Server started at ${HOST}:${PORT}`);
        })
    }
)