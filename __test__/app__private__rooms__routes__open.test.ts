import {request} from "./jest.setup";
import {PrivateRoomWithLeaveUsersDTO} from "../src/dtos/privateRoomDTO";

describe('Открываем комнату', () => {

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
            user2 = res.body;
            expect(res.status).toEqual(200);
        });
    });

    describe('Создание комнат', ()=>{
        it('Успешное создание комнаты', async ()=>{

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"login":user2.login})
            expect(res.status).toEqual(200)
            const room:PrivateRoomWithLeaveUsersDTO =  res.body
            expect(room.name).toEqual(user2.login)
            expect(room.leave_users).toEqual([{login: user2.login}])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u:any)=>u.login==user1.login).length).toEqual(1)
            expect(room.users.filter((u:any)=>u.login==user2.login).length).toEqual(1)
        })
        it('Успешное открытие комнаты', async ()=>{

            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"login":user1.login})
            expect(res.status).toEqual(200)
            const room:PrivateRoomWithLeaveUsersDTO =  res.body
            expect(room.name).toEqual(user1.login)
            expect(room.leave_users).toEqual([])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u:any)=>u.login==user1.login).length).toEqual(1)
            expect(room.users.filter((u:any)=>u.login==user2.login).length).toEqual(1)
        })
    })
})