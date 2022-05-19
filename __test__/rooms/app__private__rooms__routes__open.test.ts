import {request} from "../jest.setup";
import {PrivateRoomWithLeaveUsersDTO, PrivateRoomWithMessagesDTO} from "../../src/dtos/privateRoomDTO";
import UserDto from "../../src/dtos/userDTO";

describe('Открываем комнату', () => {

    let cookie__value__user1 = ""
    let user1:UserDto;
    let cookie__value__user2 = ""
    let user2:UserDto;
    describe('POST /api/auth/registration',  () => {
        it('Регистрируем первого пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({ "login":"user1","email":"mail1@mail.ru", "password":"12345","confirmPassword":"12345"})
            cookie__value__user1 = res.headers['set-cookie'][0]
            user1 = res.body;
            expect(res.status).toEqual(200);
        });

        it('Регистрируем второго пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({ "login":"user2","email":"mail2@mail.ru", "password":"12345","confirmPassword":"12345"})
            cookie__value__user2 = res.headers['set-cookie'][0]
            user2 = res.body;
            expect(res.status).toEqual(200);
        });
    });

    describe('Создание комнат', ()=>{
        it('Успешное создание комнаты', async ()=>{

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"login":user2.login})
            expect(res.status).toEqual(200)
            const room:PrivateRoomWithMessagesDTO =  res.body
            expect(room.name).toEqual(user2.login)
            expect(room.messages).toEqual([])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u:any)=>u.login==user1.login).length).toEqual(1)
            expect(room.users.filter((u:any)=>u.login==user2.login).length).toEqual(1)
        })

        it('Попытка получить комнаты первого пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user1};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(1)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user1.login).length).toEqual(1)
                expect(room.users.filter(u => u.login == user2.login).length).toEqual(1)
                expect(room.leave_users).toEqual([{login:user2.login}])
            })
        })

        it('Попытка получить комнаты второго пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user2};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(1)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user1.login).length).toEqual(1)
                expect(room.users.filter(u => u.login == user2.login).length).toEqual(1)
                expect(room.leave_users).toEqual([{login:user2.login}])
            })
        })

        it('Успешное открытие комнаты', async ()=>{

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"login":user1.login})
            expect(res.status).toEqual(200)
            const room:PrivateRoomWithMessagesDTO =  res.body
            expect(room.name).toEqual(user1.login)
            expect(room.messages).toEqual([])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u:any)=>u.login==user1.login).length).toEqual(1)
            expect(room.users.filter((u:any)=>u.login==user2.login).length).toEqual(1)
        })

        it('Попытка получить комнаты первого пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user1};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(1)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user1.login).length).toEqual(1)
                expect(room.users.filter(u => u.login == user2.login).length).toEqual(1)
                expect(room.leave_users).toEqual([])
            })
        })

        it('Попытка получить комнаты второго пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user2};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(1)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user1.login).length).toEqual(1)
                expect(room.users.filter(u => u.login == user2.login).length).toEqual(1)
                expect(room.leave_users).toEqual([])
            })
        })
    })

    describe('Создание комнат с самим собой', ()=>{
        it('Успешное создание комнаты c самим собой первый пользователь', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"login": user1.login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithMessagesDTO = res.body
            expect(room.name).toEqual(user1.login)
            expect(room.users).toEqual([{login: user1.login}])
            expect(room.messages).toEqual([])
        })

        it('Попытка получить комнаты первого пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user1};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(2)

            data.forEach((room) => {
                expect(room.users.filter(u => u.login == user1.login).length).toEqual(1)
                // expect(room.users.filter(u => u.login == user2.login).length).toEqual(1)
                expect(room.leave_users).toEqual([])
            })
        })

        it('Успешное создание комнаты c самим собой второй пользователь', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"login": user2.login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithMessagesDTO = res.body
            expect(room.name).toEqual(user2.login)
            expect(room.users).toEqual([{login: user2.login}])
            expect(room.messages).toEqual([])
        })

        it('Попытка получить комнаты второго пользователя', async () => {
            const res = await request.get('/api/private-rooms/rooms').set('Cookie', `${cookie__value__user2};`).send()
            expect(res.status).toEqual(200)

            const data: PrivateRoomWithLeaveUsersDTO[] = res.body
            expect(data.length).toEqual(2)

            data.forEach((room) => {
                // expect(room.users.filter(u => u.login == user1.login).length).toEqual(1)
                expect(room.users.filter(u => u.login == user2.login).length).toEqual(1)
                expect(room.leave_users).toEqual([])
            })
        })
    })
})