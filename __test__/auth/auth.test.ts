import {request} from "../jest.setup";
import UserDto from "../../src/dtos/userDTO";


const userPayload = {
    login: "user1",
    email: "mail@mail.ru",
    password: "12345",
    confirmPassword: "12345"
}

describe('Авторизация', () => {
    describe('Попытка входа с некорректными данными', () => {
        it('Возврашает сообщение с ошибкой и код 400', async () => {
            const res = await request.post('/api/auth/login').send({a:123})
            expect(res.body.message).toEqual("Email не указан")
            expect(res.status).toEqual(400);
        });
    });

    describe('Успешная регистрация пользователя', () => {
        it('Должен вернуть данные пользователя и код 200', async () => {
            const res = await request.post('/api/auth/registration').send(userPayload)
            expect(res.status).toEqual(200);
            expect(res.body).toEqual({
                id: expect.any(String),
                email: "mail@mail.ru",
                login: "user1",
            })
            expect(res.body.id).toHaveLength(24)
        });
    });

    describe('Регистрация пользователя с таким же логином', () => {
        it('Должен вернуть сообщение об ошибке и код 400', async () => {
            const res = await request.post('/api/auth/registration').send({...userPayload, email: "another@mail.ru"})
            expect(res.body.message).toEqual("Такой login уже используется")
            expect(res.status).toEqual(400);
        });
    });
    describe('Регистрация пользователя с таким же email', () => {
        it('Должен вернуть сообщение об ошибке и код 400', async () => {
            const res = await request.post('/api/auth/registration').send({...userPayload, login: "user2"})
            expect(res.body.message).toEqual("Такой E-mail уже используется")
            expect(res.status).toEqual(400);
        });
    });
});
