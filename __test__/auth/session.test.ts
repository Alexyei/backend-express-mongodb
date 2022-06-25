import {request} from "../jest.setup";

const userPayload = { login:"user1",email:"mail@mail.ru", password:"12345",confirmPassword:"12345"}
let cookie__value = ""

describe('Аутентификация на основе сессий', () => {
    describe('Неаутентифицированный пользователь пытается получить доступ к приватному маршруту', () => {
        it('Должен вернуть сообщение об ошибке и код 401', async () => {
            const res = await request.post('/api/auth/user-data').send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401);
        });
    });

    describe('Получаем cookie после регистрации', () => {
        it('Должен вернуть cookie и код 200', async () => {
            const res = await request.post('/api/auth/registration').send(userPayload)
            cookie__value = res.headers['set-cookie'][0]
            expect(cookie__value).toEqual(expect.any(String))
            expect(res.status).toEqual(200);
        });
    });

    describe('Аутентифицированный пользователь обращается к приватному маршруту', () => {
        it('Должен вернуть данные и код 200', async () => {
            const res = await (request).post('/api/auth/user-data').set('Cookie', `${cookie__value};`).send()
            expect(res.status).toEqual(200);

            expect(res.body).toEqual({
                id: expect.any(String),
                login: userPayload.login,
                email: userPayload.email
            })
        });
    });

    describe('Удаляем сессию', () => {
        it('Должен вернуть код 200', async () => {
            const res = await (request).post('/api/auth/logout').set('Cookie', `${cookie__value};`).send()
            // expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(200);
        });
    });

    describe('Пользователь опять не аутентифицирован', () => {
        it('Должен вернуть сообщение об ошибке и код 401', async () => {
            const res = await request.post('/api/auth/user-data').set('Cookie', `${cookie__value};`).send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401);
        });
    });
});
