import {request} from "./jest.setup";

describe('Маршруты публичных комнат create', () => {

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
    });


    describe('Валидация', () => {
        it('Попытка создать комнату не авторизованным пользователем (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').send({})
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401)
        })

        it('Попытка создать комнату без параметров (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({})
            expect(res.body.message).toEqual("Некорректная длина названия")
            expect(res.status).toEqual(400)
        })
        it('Попытка создать комнату некорректный password max (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"password": "1".repeat(33)})
            expect(res.body.message).toEqual("Некорректная длина пароля")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный name min (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": "1".repeat(2)})
            expect(res.body.message).toEqual("Некорректная длина названия")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный name max (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": "1".repeat(33)})
            expect(res.body.message).toEqual("Некорректная длина названия")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный name 20 (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": "1".repeat(20)})
            expect(res.body.message).toEqual("Название комнаты не может содержать ровно 20 или 24 символа")
            expect(res.status).toEqual(400)
        })

        it('Попытка создать комнату некорректный name 24 (валидация)', async () => {
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": "1".repeat(24)})
            expect(res.body.message).toEqual("Название комнаты не может содержать ровно 20 или 24 символа")
            expect(res.status).toEqual(400)
        })

        it('Попытка получить комнаты пользователя неавторизованным пользователем', async () => {
            const res = await request.get('/api/public-rooms/rooms').send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401)
        })
    })
    describe('Создание комнат', () => {
        it('Попытка получить комнаты пользователя (комнаты не созданы)', async () => {
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.body).toEqual([])
            expect(res.status).toEqual(200)
        })

        it('Успешное создание комнаты без пароля', async () => {
            const name = "first__room"
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": name})
            expect(res.body.name).toEqual(name)
            expect(res.body.owner).toEqual(user.id)
            expect(res.status).toEqual(200)
        })

        it('Попытка создать комнату с таким же именем', async () => {
            const name = "first__room"
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": name})
            expect(res.body.message).toEqual("Такое название группы уже используется")
            expect(res.status).toEqual(400)
        })

        it('Успешное создание комнаты c паролем', async () => {
            const name = "second__room";
            const password = "12345";
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({
                "password": password,
                "name": name
            })
            expect(res.body.name).toEqual(name)
            expect(res.body.owner).toEqual(user.id)
            expect(res.status).toEqual(200)
        })

        it('Попытка получить комнаты пользователя', async () => {
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.body.length).toEqual(2)
            res.body.forEach((room: any) => {
                expect(room.owner.login).toEqual(user.login)
                expect(room.users).toEqual([{login: user.login}])
            })
            expect(res.status).toEqual(200)
        })
    })
    describe('Получаем комнаты только для текущего пользователя', () => {
        let cookie__value__user2 = "";
        let user2:any = null;
        it('Регистрируем второго пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user2",
                "email": "mail2@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            cookie__value__user2 = res.headers['set-cookie'][0]
            user2 = res.body;
            expect(res.status).toEqual(200);
        });

        it('Попытка получить комнаты пользователя (комнаты не созданы)', async () => {
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value__user2};`).send()
            expect(res.body).toEqual([])
            expect(res.status).toEqual(200)
        })

        it('Попытка создать комнату с таким же именем', async () => {
            const name = "first__room"
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"name": name})
            expect(res.body.message).toEqual("Такое название группы уже используется")
            expect(res.status).toEqual(400)
        })

        it('Успешное создание комнаты без пароля', async () => {
            const name = "first__user2__room"
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"name": name})
            expect(res.body.name).toEqual(name)
            expect(res.body.owner).toEqual(user2.id)
            expect(res.status).toEqual(200)
        })


        it('Успешное создание комнаты c паролем', async () => {
            const name = "second__user2__room";
            const password = "12345";
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user2};`).send({
                "password": password,
                "name": name
            })
            expect(res.body.name).toEqual(name)
            expect(res.body.owner).toEqual(user2.id)
            expect(res.status).toEqual(200)
        })

        it('Попытка получить комнаты второго пользователя', async () => {
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value__user2};`).send()
            expect(res.body.length).toEqual(2)
            res.body.forEach((room: any) => {
                expect(room.name.includes("user2")).toEqual(true)
                expect(room.owner.login).toEqual(user2.login)
                expect(room.users).toEqual([{login: user2.login}])
            })
            expect(res.status).toEqual(200)
        })

        it('Попытка получить комнаты первого пользователя', async () => {
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.body.length).toEqual(2)
            res.body.forEach((room: any) => {
                expect(room.name.includes("user2")).toEqual(false)
                expect(room.owner.login).toEqual(user.login)
                expect(room.users).toEqual([{login: user.login}])
            })
            expect(res.status).toEqual(200)
        })
    })
});