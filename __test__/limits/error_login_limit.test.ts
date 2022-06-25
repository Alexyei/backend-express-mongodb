import UserDto from "../../src/dtos/userDTO";
import config from "../../src/config/default";
import {request} from "../jest.setup";
import redisClient from "../../src/db/redis";
import {SessionAuthLimitData} from "../../src/service/sessionAuthLimitService";

describe('Защита от перебора паролей', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    beforeAll(async () => {
        await redisClient.v4.FLUSHALL()
    })

    describe('Регистрация пользоватилей', () => {
        it('Регистрируем первого пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user1",
                "email": "mail1@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            cookie__value__user1 = res.headers['set-cookie'][0]
            user1 = res.body;
            expect(res.status).toEqual(200);
        });
    });

    describe('POST /api/auth/login', () => {
        it('Неправильный пароль', async () => {
            for (let i = 0; i < config.userLimits.auth.passwordErrors; ++i) {
                const res = await request.post('/api/auth/login').send({email: "mail1@mail.ru", password: "abcde"})
                expect(res.body.message).toEqual("Неверный email или пароль")
                expect(res.status).toEqual(400);
            }
        });
    });

    describe('POST /api/auth/login', () => {
        it('Превышаем лимит', async () => {
                const res = await request.post('/api/auth/login').send({email: "mail1@mail.ru", password: "abcde"})
                expect(res.body.message).toEqual(`Достигнут лимит поптыок входа, блокировка авторизации на ${config.userLimits.auth.blockTimeMinutes} минут`)
                expect(res.status).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('Попытка успешной авторизации', async () => {
            const res = await request.post('/api/auth/login').send({email: "mail1@mail.ru", password: "12345"})
            expect(res.body.message).toEqual(`Достигнут лимит поптыок входа, блокировка авторизации на ${config.userLimits.auth.blockTimeMinutes} минут`)
            expect(res.status).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('Попытка успешной авторизации', async () => {
            const res = await request.post('/api/auth/login').send({email: "mail1@mail.ru", password: "12345"})
            expect(res.body.message).toEqual(`Достигнут лимит поптыок входа, блокировка авторизации на ${config.userLimits.auth.blockTimeMinutes} минут`)
            expect(res.status).toEqual(400);
        });
    });

    describe('POST /api/auth/login', () => {
        it('Успешной авторизации', async () => {
            const session_auth_key = `sess_auth:${"mail1@mail.ru"}`
            let sessionData = await redisClient.v4.GET(session_auth_key)
            const data: SessionAuthLimitData = JSON.parse(sessionData)

            data.blocked = new Date();
            sessionData = JSON.stringify(data)
            await redisClient.v4.SET(session_auth_key, sessionData as string)
            const res = await request.post('/api/auth/login').send({email: "mail1@mail.ru", password: "12345"})
            expect(res.status).toEqual(200);
        });
    });

    describe('POST /api/auth/login', () => {
        it('Неправильный пароль опять', async () => {
            const res = await request.post('/api/auth/login').send({email: "mail1@mail.ru", password: "abcde"})
            expect(res.body.message).toEqual(`Неверный email или пароль`)
            expect(res.status).toEqual(400);
        });
    });
});