import {request} from "../jest.setup";
import {PrivateRoomWithLeaveUsersDTO, PrivateRoomWithMessagesDTO} from "../../src/dtos/privateRoomDTO";
import {PublicRoomWithLoginsDTO} from "../../src/dtos/publicRoomDTO";

describe('Получаем отдельно публичные и приватные комнаты', () => {

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

    describe('Создаём публичные комнаты', () => {
        it('Успешное создание комнаты без пароля', async () => {
            const name = "first__room"
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({"name": name})
            expect(res.status).toEqual(200)
            const data:PublicRoomWithLoginsDTO = res.body;
            expect(data.name).toEqual(name)
            expect(data.owner.login).toEqual(user.login)
            expect(data.password).toEqual(false)
            expect(data.users).toEqual([{login:user.login}])
        })

        it('Успешное создание комнаты c паролем', async () => {
            const name = "second__room";
            const password = "12345";
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value};`).send({
                "password": password,
                "name": name
            })
            expect(res.status).toEqual(200)
            const data:PublicRoomWithLoginsDTO = res.body;
            expect(data.name).toEqual(name)
            expect(data.owner.login).toEqual(user.login)
            expect(data.password).toEqual(true)
            expect(data.users).toEqual([{login:user.login}])
        })
    })
    describe('Создаём приватные комнаты', () => {
        const login = "user2";
        it('Регистрируем второго пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({ "login":login,"email":"mail2@mail.ru", "password":"12345","confirmPassword":"12345"})
            expect(res.status).toEqual(200);
        });
        it('Успешное создание комнаты', async ()=>{

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login":login})
            expect(res.status).toEqual(200)
            const room:PrivateRoomWithMessagesDTO =  res.body
            expect(room.name).toEqual(login)
            expect(room.messages).toEqual([])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u:any)=>u.login==user.login).length).toEqual(1)
            expect(room.users.filter((u:any)=>u.login==login).length).toEqual(1)
        })
        it('Успешное создание комнаты c самим собой', async ()=>{
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value};`).send({"login":user.login})
            expect(res.status).toEqual(200)
            const room:PrivateRoomWithMessagesDTO =  res.body
            expect(room.name).toEqual(user.login)
            expect(room.users).toEqual([{login:user.login}])
            expect(room.messages).toEqual([])
        })
    })

    describe('Получаем публичные комнаты', () => {
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
    describe('Получаем приватные комнаты', () => {
        it('Попытка получить комнаты пользователя', async ()=>{
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value};`).send()
            expect(res.status).toEqual(200)

            const data:PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(2)

            data.forEach((room)=>{
                expect(room.users.filter(u=>u.login==user.login).length).toEqual(1)
            })
        })
    })
})