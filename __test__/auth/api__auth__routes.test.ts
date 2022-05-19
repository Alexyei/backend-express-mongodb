import {request} from "../jest.setup";
import UserDto from "../../src/dtos/userDTO";


describe('Маршруты авторизации', () => {
    describe('POST /api/auth/login', () => {
        it('Предоставлены некорректные данные для входа', async () => {
            const res = await request.post('/api/auth/login').send({a:123})
            expect(res.body.message).toEqual("Ошибка при валидации")
            expect(res.status).toEqual(400);
        });
    });

    describe('POST /api/auth/registration', () => {
        it('Успешная регистрация пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({"login":" user1", "email":"mail@mail.ru", "password":"12345","confirmPassword":"12345"})
            expect(res.status).toEqual(200);
        });
    });

    describe('POST /api/auth/registration', () => {
        it('Регистрация пользователя с таким же логином', async () => {
            const res = await request.post('/api/auth/registration').send({"login":" user1", "email":"mail1@mail.ru", "password":"12345","confirmPassword":"12345"})
            expect(res.body.message).toEqual("Ошибка при валидации")
            expect(res.status).toEqual(400);
        });
    });
    describe('POST /api/auth/registration', () => {
        it('Регистрация пользователя с таким же email', async () => {
            const res = await request.post('/api/auth/registration').send({"login":" user2", "email":"mail@mail.ru", "password":"12345","confirmPassword":"12345"})
            expect(res.body.message).toEqual("Ошибка при валидации")
            expect(res.status).toEqual(400);
        });
    });
});
