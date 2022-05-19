// import supertest from "supertest";
//
// import {app, server} from "../src/App";
//
//
// import {connectDB, disconnectDB} from "../src/db/connect";
//
// const request = supertest(app);



import {request} from "../jest.setup";

describe('Аутентификация на основе сессий', () => {
    // beforeAll(() => {
    //     connectDB();
    // });
    //
    // afterAll(() => {
    //     disconnectDB();
    //     server.close();
    // });
    let cookie__value = ""

    describe('POST /api/auth/user-data', () => {
        it('Неаутентифицированный пользователь пытается получить доступ к приватному маршруту', async () => {
            const res = await request.post('/api/auth/user-data').send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401);
        });
    });

    describe('POST /api/auth/registration', () => {
        it('Успешная аутентификация', async () => {
            const res = await request.post('/api/auth/registration').send({ "login":"user1","email":"mail@mail.ru", "password":"12345","confirmPassword":"12345"})
            // expect(res.body.message).toEqual("Ошибка при валидации")
            // console.log(res.body)
            cookie__value = res.headers['set-cookie'][0]
            // (res as any).cookie('sessionId', cookie__value);
            expect(res.status).toEqual(200);
        });
    });

    describe('POST /api/auth/user-data', () => {
        it('Аутентифицированный пользователь пытается получить доступ к приватному маршруту', async () => {
            const res = await (request).post('/api/auth/user-data').set('Cookie', `${cookie__value};`).send()
            // expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(200);
            expect(res.text).toContain("\"email\":\"mail@mail.ru\"")
            expect(res.text).toContain("\"login\":\"user1\"")
        });
    });

    describe('POST /api/auth/logout', () => {
        it('Удаляем сессию', async () => {
            const res = await (request).post('/api/auth/logout').set('Cookie', `${cookie__value};`).send()
            // expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(302);
        });
    });

    describe('POST /api/auth/user-data', () => {
        it('Пользователь опять не аутентифицирован', async () => {
            const res = await request.post('/api/auth/user-data').send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401);
        });
    });
});
