import {request} from "./jest.setup";

describe('Маршруты публичных комнат join', () => {
    let cookie__value__user1 = ""
    let user1:any = null;
    let cookie__value__user2 = ""
    let user2:any = null;
    describe('POST /api/auth/registration', () => {
        it('Регистрируем первого пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({ "login":"user1","email":"mail1@mail.ru", "password":"12345","confirmPassword":"12345"})
            cookie__value__user1 = res.headers['set-cookie'][0]
            user1 = res.body;
            expect(res.status).toEqual(200);
        });
        it('Регистрируем второго пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({ "login":"user2","email":"mail2@mail.ru", "password":"12345","confirmPassword":"12345"})
            cookie__value__user2 = res.headers['set-cookie'][0]
            user2 = res.body
            expect(res.status).toEqual(200);
        });
    });

    describe('Валидация', () => {
        it('Попытка войти в комнату не авторизованным пользователем (валидация)', async ()=>{
            const res = await request.post('/api/public-rooms/join').send()
            expect(res.body.message).toEqual("Пользователь не авторизован")
            expect(res.status).toEqual(401)
        })

        it('Попытка войти в комнату без параметров (валидация)', async ()=>{
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user1};`).send()
            expect(res.body.message).toEqual("Некорректная длина названия")
            expect(res.status).toEqual(400)
        })

        it('Попытка войти в комнату некорректный password max (валидация)', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"password":"1".repeat(33)})
            expect(res.body.message).toEqual("Некорректная длина пароля")
            expect(res.status).toEqual(400)
        })

        it('Попытка войти в комнату некорректный name min (валидация)', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"name":"1".repeat(2)})
            expect(res.body.message).toEqual("Некорректная длина названия")
            expect(res.status).toEqual(400)
        })

        it('Попытка войти в  комнату некорректный name max (валидация)', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"name":"1".repeat(33)})
            expect(res.body.message).toEqual("Некорректная длина названия")
            expect(res.status).toEqual(400)
        })

        it('Попытка войти в несуществующую комнату', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"name":"1".repeat(7)})
            expect(res.body.message).toEqual("Не найдена группа с таким названием")
            expect(res.status).toEqual(400)
        })
    })

    describe('Вход в комнату (комната без пароля)', () => {
        const name = "first__room"
        it('Успешное создание комнаты без пароля', async ()=>{

            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"name":name})
            expect(res.body.name).toEqual(name)
            expect(res.body.owner).toEqual(user1.id)
            expect(res.status).toEqual(200)
        })

        it('Попытка войти в комнату, уже находясь там', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"name":name})
            expect(res.body.message).toEqual("Вы уже вступили в эту комнату")
            expect(res.status).toEqual(400)
        })

        it('Успешная попытка войти в комнату', async ()=>{
            const name = "first__room";
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user2};`).send({"name":name})
            expect(res.status).toEqual(200)
            expect(res.body.name).toEqual(name)
            expect(res.body.password).toEqual(false)
            expect(res.body.owner.login).toEqual(user1.login)
            expect(res.body.users.length).toEqual(2)
            expect(res.body.users.filter((u:any)=>u.login == user1.login).length).toEqual(1)
            expect(res.body.users.filter((u:any)=>u.login == user2.login).length).toEqual(1)
        })
    })

    describe('Вход в комнату (комната c паролем)', () => {
        const name = "second__room"
        const password = "12345"

        it('Успешное создание комнаты с паролем', async ()=>{
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"password":password,"name":name})
            expect(res.body.name).toEqual(name)
            expect(res.body.owner).toEqual(user2.id)
            expect(res.status).toEqual(200)
        })

        it('Попытка войти в комнату, уже находясь там', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user2};`).send({"password":password,"name":name})
            expect(res.body.message).toEqual("Вы уже вступили в эту комнату")
            expect(res.status).toEqual(400)
        })

        it('Попытка войти в комнату, без пароля', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user2};`).send({"name":name})
            expect(res.body.message).toEqual("Неверное название комнаты или пароль")
            expect(res.status).toEqual(400)
        })

        it('Попытка войти в комнату, c неверным паролем', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user2};`).send({"password":"12","name":name})
            expect(res.body.message).toEqual("Неверное название комнаты или пароль")
            expect(res.status).toEqual(400)
        })

        it('Успешная попытка войти в комнату', async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"password":password,"name":name})
            expect(res.status).toEqual(200)
            expect(res.body.name).toEqual(name)
            expect(res.body.password).toEqual(true)
            expect(res.body.owner.login).toEqual(user2.login)
            expect(res.body.users.length).toEqual(2)
            expect(res.body.users.filter((u:any)=>u.login == user1.login).length).toEqual(1)
            expect(res.body.users.filter((u:any)=>u.login == user2.login).length).toEqual(1)
        })
    })

    describe('Получаем комнаты пользователей', () => {
        it('Попытка получить комнаты первого пользователя', async ()=>{
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value__user1};`).send()
            expect(res.body.length).toEqual(2)
            res.body.forEach((room:any)=>{
                expect(room.password).toBeDefined()
                expect(room.users.length).toEqual(2)
                expect(room.users.filter((u:any)=>u.login == user1.login).length).toEqual(1)
                expect(room.users.filter((u:any)=>u.login == user2.login).length).toEqual(1)
            })
            expect(res.status).toEqual(200)
        })

        it('Попытка получить комнаты второго пользователя', async ()=>{
            const res = await request.get('/api/public-rooms/rooms').set('Cookie', `${cookie__value__user2};`).send()
            expect(res.body.length).toEqual(2)
            res.body.forEach((room:any)=>{
                expect(room.password).toBeDefined()
                expect(room.users.length).toEqual(2)
                expect(room.users.filter((u:any)=>u.login == user1.login).length).toEqual(1)
                expect(room.users.filter((u:any)=>u.login == user2.login).length).toEqual(1)
            })
            expect(res.status).toEqual(200)
        })
    })
});