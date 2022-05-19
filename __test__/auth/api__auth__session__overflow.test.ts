import redisClient from "../../src/db/redis";

import {request} from "../jest.setup";
import {SessionData} from "../../src/service/sessionService";
import config from '../../src/config/default'

let cookie__value = "";

describe('Защита Redis от переполнения одним пользователем', () => {

    describe('Лимит сессий необходимый для тестов', () => {
        expect(config.session.limitPerUser).toBeGreaterThanOrEqual(2)
    })

    describe('Сохранений сессий при регистрации пользователей', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        it('Регистрация первого пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user1",
                "email": "mail1@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);


            const session = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);
            expect(userData.sessions[0]).toEqual(session);
        });
        it('Регистрация второго пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user2",
                "email": "mail2@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            expect(res.status).toEqual(200);

            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(4);
        });
    });

    describe('Превышение лимита сессий', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        // куки не сохраняются
        it('Заполненяем все свои сессии', async () => {
            for (let i = 0; i < config.session.limitPerUser; ++i) {
                const res = await request.post('/api/auth/login').send({
                    "email": "mail1@mail.ru",
                    "password": "12345",
                })
                expect(res.status).toEqual(200);


                const keys = await redisClient.v4.KEYS('*')
                expect(keys.length).toEqual(i + 2);


                const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
                expect(sessionData).not.toBeUndefined()
                const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
                expect(userData.sessions.length).toEqual(i + 1);
            }
        });

        it('Первышаем лимит сессиий', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(config.session.limitPerUser + 1);


            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(config.session.limitPerUser);
        });
    });

    describe('Превышение лимита сессий (два пользователя)', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })


        let firstUserSessionData = "";
        const firstUserKeysCount = config.session.limitPerUser + 1;
        // куки не сохраняются
        it('Заполненяем все свои сессии', async () => {
            for (let i = 0; i < config.session.limitPerUser; ++i) {
                const res = await request.post('/api/auth/login').send({
                    "email": "mail1@mail.ru",
                    "password": "12345",
                })
                expect(res.status).toEqual(200);


                const keys = await redisClient.v4.KEYS('*')
                expect(keys.length).toEqual(i + 2);


                const sessionData = firstUserSessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
                expect(sessionData).not.toBeUndefined()
                const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
                expect(userData.sessions.length).toEqual(i + 1);
            }
        });

        it('Первышаем лимит сессиий', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(config.session.limitPerUser + 1);


            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(config.session.limitPerUser);
        });

        it('Заполненяем все свои сессии (второй пользователь)', async () => {
            for (let i = 0; i < config.session.limitPerUser; ++i) {
                const res = await request.post('/api/auth/login').send({
                    "email": "mail2@mail.ru",
                    "password": "12345",
                })
                expect(res.status).toEqual(200);


                const keys = await redisClient.v4.KEYS('*')
                expect(keys.length).toEqual(i + 2 + firstUserKeysCount);


                const sessionData = firstUserSessionData = keys.filter((key: string) => key.startsWith("sess_data") && key != firstUserSessionData)[0]
                expect(sessionData).not.toBeUndefined()
                const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
                expect(userData.sessions.length).toEqual(i + 1);
            }
        });

        it('Первышаем лимит сессиий (второй пользователь)', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail2@mail.ru",
                "password": "12345",
            })
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(config.session.limitPerUser + 1 + firstUserKeysCount);


            const sessionData = keys.filter((key: string) => key.startsWith("sess_data") && key != firstUserSessionData)[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(config.session.limitPerUser);
        });
    });

    describe('Пользователь перезаходит в другой аккаунт', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        let firstUserSession = "";
        let firstUserID = ""

        // куки сохраняются
        it('Выполняем вход', async () => {

            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            firstUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            firstUserID = JSON.parse(await redisClient.v4.GET(firstUserSession)).userID
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]

            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);

        });

        it('Выполняем вход в другой аккаунт', async () => {
            const res = await request.post('/api/auth/login').set('Cookie', `${cookie__value};`).send({
                "email": "mail2@mail.ru",
                "password": "12345",
            })
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            expect(secondUserSession).toEqual(firstUserSession)
            const secondUserID = JSON.parse(await redisClient.v4.GET(secondUserSession)).userID
            expect(firstUserID).not.toEqual(secondUserID)

            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);
            expect(userData.user.id).toEqual(secondUserID)
        });


    });

    describe('Пользователь выполняет вход будучи авторизованным', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        let firstUserSession = "";
        let firstUserID = ""

        // куки сохраняются
        it('Выполняем вход', async () => {

            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            firstUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            firstUserID = JSON.parse(await redisClient.v4.GET(firstUserSession)).userID
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]

            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);

        });

        it('Выполняем повторный вход', async () => {
            const res = await request.post('/api/auth/login').set('Cookie', `${cookie__value};`).send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            expect(secondUserSession).toEqual(firstUserSession)
            const secondUserID = JSON.parse(await redisClient.v4.GET(secondUserSession)).userID
            expect(firstUserID).toEqual(secondUserID)

            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);
            expect(userData.user.id).toEqual(secondUserID)
        });


    });

    describe('Пользователь выполняет выход', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        let firstUserSession = "";
        let firstUserID = ""

        // куки не сохраняются
        it('Выполняем вход', async () => {

            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            // cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            firstUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            firstUserID = JSON.parse(await redisClient.v4.GET(firstUserSession)).userID
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]

            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);

        });

        // куки сохраняются
        it('Выполняем повторный вход', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(3);

            // const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(secondUserSession).toEqual(firstUserSession)
            // const secondUserID = await redisClient.v4.GET(secondUserSession)
            // expect(firstUserID).toEqual(secondUserID)

            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(2);
            // expect(userData.user.id).toEqual(secondUserID)
        });


        // куки не сохраняются
        it('Выполняем выход', async () => {
            const res = await request.post('/api/auth/logout').set('Cookie', `${cookie__value};`).send()

            expect(res.status).toEqual(302);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            // const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(secondUserSession).toEqual(firstUserSession)
            // const secondUserID = await redisClient.v4.GET(secondUserSession)
            // expect(firstUserID).toEqual(secondUserID)

            const session = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            expect(session).toEqual(firstUserSession)
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);
            expect(userData.sessions[0]).toEqual(firstUserSession)
            expect(userData.user.id).toEqual(firstUserID)
        });
    });

    describe('Пользователь выполняет выход со всех устройств', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        let firstUserSession = "";
        let firstUserID = ""

        // куки не сохраняются
        it('Выполняем вход', async () => {

            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            // cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            firstUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            firstUserID = await redisClient.v4.GET(firstUserSession)
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]

            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);

        });

        // куки сохраняются
        it('Выполняем повторный вход', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(3);

            // const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(secondUserSession).toEqual(firstUserSession)
            // const secondUserID = await redisClient.v4.GET(secondUserSession)
            // expect(firstUserID).toEqual(secondUserID)

            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(2);
            // expect(userData.user.id).toEqual(secondUserID)
        });


        // куки не сохраняются
        it('Выполняем выход со всех устройств', async () => {
            const res = await request.post('/api/auth/clear').set('Cookie', `${cookie__value};`).send()

            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(0);

            // const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(secondUserSession).toEqual(firstUserSession)
            // const secondUserID = await redisClient.v4.GET(secondUserSession)
            // expect(firstUserID).toEqual(secondUserID)

            // const session = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(session).toEqual(firstUserSession)
            // const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            // expect(sessionData).not.toBeUndefined()
            // const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            // expect(userData.sessions.length).toEqual(1);
            // expect(userData.sessions[0]).toEqual(firstUserSession)
            // expect(userData.user.id).toEqual(firstUserID)
        });
    });

    describe('Пользователь выполняет выход со всех устройств (два пользователя)', () => {
        beforeAll(async () => {
            await redisClient.v4.FLUSHALL()
        })

        let firstUserSession_1 = "";
        let firstUserSession_2 = "";
        let firstUserID = ""

        // куки не сохраняются
        it('Выполняем вход', async () => {

            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            // cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(2);

            firstUserSession_1 = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            firstUserID = JSON.parse(await redisClient.v4.GET(firstUserSession_1)).userID
            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]

            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);

        });

        // куки сохраняются
        it('Выполняем повторный вход', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail1@mail.ru",
                "password": "12345",
            })
            cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(3);

            firstUserSession_2 = keys.filter((key: string) => !key.startsWith("sess_data") && key !== firstUserSession_1)[0]

            // const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(secondUserSession).toEqual(firstUserSession)
            // const secondUserID = await redisClient.v4.GET(secondUserSession)
            // expect(firstUserID).toEqual(secondUserID)

            const sessionData = keys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(2);
            // expect(userData.user.id).toEqual(secondUserID)
        });

        // куки не сохраняются
        it('Выполняем вход (второй пользователь)', async () => {

            const res = await request.post('/api/auth/login').send({
                "email": "mail2@mail.ru",
                "password": "12345",
            })
            // cookie__value = res.headers['set-cookie'][0]
            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(5);


            const sessionData = keys.filter((key: string) => key.startsWith("sess_data") && !key.endsWith(firstUserID))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(1);

        });

        // куки не сохраняются
        it('Выполняем повторный вход (второй пользователь)', async () => {
            const res = await request.post('/api/auth/login').send({
                "email": "mail2@mail.ru",
                "password": "12345",
            })

            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(6);


            const sessionData = keys.filter((key: string) => key.startsWith("sess_data") && !key.endsWith(firstUserID))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(2);
            // expect(userData.user.id).toEqual(secondUserID)
        });

        // куки не сохраняются
        it('Выполняем выход со всех устройств', async () => {
            const res = await request.post('/api/auth/clear').set('Cookie', `${cookie__value};`).send()

            expect(res.status).toEqual(200);


            const keys = await redisClient.v4.KEYS('*')
            expect(keys.length).toEqual(3);

            const secondUserKeys = keys.filter((key: string) => ![firstUserSession_1, firstUserSession_2].includes(key))
            expect(secondUserKeys.length).toEqual(3);

            // const secondUserSession = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(secondUserSession).toEqual(firstUserSession)
            // const secondUserID = await redisClient.v4.GET(secondUserSession)
            // expect(firstUserID).toEqual(secondUserID)

            // const session = keys.filter((key: string) => !key.startsWith("sess_data"))[0]
            // expect(session).toEqual(firstUserSession)
            const sessionData = secondUserKeys.filter((key: string) => key.startsWith("sess_data"))[0]
            expect(sessionData).not.toBeUndefined()
            const userData: SessionData = JSON.parse(await redisClient.v4.GET(sessionData))
            expect(userData.sessions.length).toEqual(2);
            expect(userData.sessions.includes(firstUserSession_1)).toEqual(false)
            expect(userData.sessions.includes(firstUserSession_2)).toEqual(false)
            expect(userData.user.id).not.toEqual(firstUserID)
        });
    });

});