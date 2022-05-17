import {request} from "./jest.setup";
import {PrivateRoomWithLeaveUsersDTO} from "../src/dtos/privateRoomDTO";

describe('Маршруты приватных комнат create', () => {

    let cookie__value = ""
    let user: any = null;
    describe('POST /api/auth/registration', () => {
        it('Регистрируем первого пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user1",
                "email": "mail1@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            cookie__value = res.headers['set-cookie'][0]
            user = res.body;
            expect(res.status).toEqual(200);
        });

        it('Регистрируем второго пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user2",
                "email": "mail2@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            expect(res.status).toEqual(200);
        });
    });

    describe('Валидация', () => {
        it('Попытка создать комнату не авторизованным пользователем (валидация)', async () => {
            const res = await request.post('/api/private-rooms/create').send({})
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401)
        })

        it('Попытка создать комнату без параметров (валидация)', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send()
            expect(res.body.message).toEqual("Некорректная длина логина")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный login min (валидация)', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": "1".repeat(2)})
            expect(res.body.message).toEqual("Некорректная длина логина")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный login max (валидация)', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": "1".repeat(33)})
            expect(res.body.message).toEqual("Некорректная длина логина")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный login (валидация)', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": "second__user"})
            expect(res.body.message).toEqual("Пользователь с таким логином не найден")
            expect(res.status).toEqual(400)
        })


    })

    describe('Создание комнат', () => {
        const login = "user2"
        it('Попытка получить комнаты пользователя неавторизованным пользователем', async () => {
            const res = await request.get('/api/private-rooms/rooms').send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401)
        })

        it('Попытка получить комнаты пользователя (комнаты не созданы)', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.body).toEqual([])
            expect(res.status).toEqual(200)
        })

        it('Успешное создание комнаты', async () => {

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithLeaveUsersDTO = res.body
            expect(room.name).toEqual(login)
            expect(room.leave_users).toEqual([{login: login}])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u: any) => u.login == user.login).length).toEqual(1)
            expect(room.users.filter((u: any) => u.login == login).length).toEqual(1)
        })

        it('Попытка создать комнату с таким же именем', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": login})
            expect(res.body.message).toEqual("У вас уже открыт этот чат")
            expect(res.status).toEqual(400)
        })


        it('Попытка получить комнаты пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.status).toEqual(200)
            expect(res.body.length).toEqual(1)
            res.body.forEach((room: any) => {
                expect(room.name).toEqual(login)
                expect(room.users.length).toEqual(2)
            })

        })

        it('Успешное создание комнаты c самим собой', async () => {
            // const name = "second__room";
            // const password = "12345";
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": user.login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithLeaveUsersDTO = res.body
            expect(room.name).toEqual(user.login)
            expect(room.users).toEqual([{login: user.login}])
            expect(room.leave_users).toEqual([])
        })

        it('Попытка создать комнату с таким же именем (с самим собой)', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login": user.login})
            expect(res.body.message).toEqual("У вас уже открыт этот чат")
            expect(res.status).toEqual(400)
        })

        it('Попытка получить комнаты пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(2)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user.login).length).toEqual(1)
            })
        })
    })

    describe('Получаем комнаты только для текущего пользователя', () => {
        let cookie__value__user3 = "";
        let user3: any = null;
        const login = "user2";
        it('Регистрируем третьего пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user3",
                "email": "mail3@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            cookie__value__user3 = res.headers['set-cookie'][0]
            user3 = res.body;
            expect(res.status).toEqual(200);
        });

        it('Успешное создание комнаты', async () => {

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user3};`).send({"login": login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithLeaveUsersDTO = res.body
            expect(room.name).toEqual(login)
            expect(room.leave_users).toEqual([{login}])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u: any) => u.login == user3.login).length).toEqual(1)
            expect(room.users.filter((u: any) => u.login == login).length).toEqual(1)
        })

        it('Успешное создание комнаты c самим собой', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user3};`).send({"login": user3.login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithLeaveUsersDTO = res.body
            expect(room.name).toEqual(user3.login)
            expect(room.users).toEqual([{login: user3.login}])
            expect(room.leave_users).toEqual([])
        })

        it('Попытка получить комнаты первого пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(2)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user.login).length).toEqual(1)
            })
        })

        it('Попытка получить комнаты третьего пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user3};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(2)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user3.login).length).toEqual(1)
            })
        })
    })
});