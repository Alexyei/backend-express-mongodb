import UserDto from "../../src/dtos/userDTO";
import {request} from "../jest.setup";
import {PublicRoomWithLoginsDTO} from "../../src/dtos/publicRoomDTO";
import MessageDTO from "../../src/dtos/messageDTO";
import config from "../../src/config/default"
import {PrivateRoomWithMessagesDTO} from "../../src/dtos/privateRoomDTO";

async function successSendMessage(cookie: string, roomID: string, userID: string, message: string) {
    // const res = await messageService.create(roomID, userID, message)
    const res = await request.post('/api/messages/create').set('Cookie', `${cookie};`).send({roomID, message})
    expect(res.status).toEqual(200)
    const data: MessageDTO = res.body;
    expect(data.message).toEqual(message)
    expect(data.author).toEqual(userID)
    expect(data.room).toEqual(roomID)
    return data;
}


describe('Максимальная длина сообщений', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;

    let openRoomID = ""
    let closeRoomID = ""
    let roomID = ""
    describe('Регистрация пользоватилей', () => {
        it('Регистрируем первого пользователя', async () => {
            const res = await request.post('/api/auth/registration').send({
                "login": "user1",
                "email": "mail1@mail.ru",
                "password": "12345",
                "confirmPassword": "12345"
            })
            cookie__value__user1 = res.headers['set-cookie'][0]
            user1 = res.body;
            expect(res.status).toEqual(200);
        });

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
    });

    describe('Создаём комнаты', () => {
        it('Успешное создание комнаты без пароля', async () => {
            const name = "first__room"
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"name": name})
            expect(res.status).toEqual(200)
            const data: PublicRoomWithLoginsDTO = res.body;
            expect(data.name).toEqual(name)
            expect(data.owner.login).toEqual(user1.login)
            expect(data.password).toEqual(false)
            expect(data.users).toEqual([{login: user1.login}])
            openRoomID = data.id;
        })

        it('Успешное создание комнаты c паролем', async () => {
            const name = "second__room";
            const password = "12345";
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user1};`).send({
                "password": password,
                "name": name
            })
            expect(res.status).toEqual(200)
            const data: PublicRoomWithLoginsDTO = res.body;
            expect(data.name).toEqual(name)
            expect(data.owner.login).toEqual(user1.login)
            expect(data.password).toEqual(true)
            expect(data.users).toEqual([{login: user1.login}])
            closeRoomID = data.id;
        })
    })

    describe('Успешно отправляем сообщения', () => {
        it('Отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, closeRoomID, user1.id, 'Т'.repeat(config.userLimits.messages.maxLength))
            expect(res.recipients).toEqual([user1.id])
            // }
        });

        it('Отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, openRoomID, user1.id, 'Т'.repeat(config.userLimits.messages.maxLength))
            expect(res.recipients).toEqual([user1.id])
            // }
        });
    })

    describe('Превышаем лимит', () => {
        it('Отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user1};`).send({
                "roomID": closeRoomID,
                message: 'Т'.repeat(config.userLimits.messages.maxLength + 1)
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальная длина сообщений ${config.userLimits.messages.maxLength}`)
            // }
        });

        it('Отправляем сообщение в комнату (без пароля)', async () => {
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user1};`).send({
                "roomID": openRoomID,
                message: 'Т'.repeat(config.userLimits.messages.maxLength + 1)
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальная длина сообщений ${config.userLimits.messages.maxLength}`)
        });
    })

    describe('Создаём комнату', () => {
        it('Успешное создание приватной комнаты для себя самого', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"login": user1.login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithMessagesDTO = res.body
            roomID = room.id;
            expect(room.name).toEqual(user1.login)
            expect(room.messages).toEqual([])
            expect(room.users.length).toEqual(1)
            expect(room.users.filter((u: any) => u.login == user1.login).length).toEqual(1)
        })
    })

    describe('Успешно отправляем сообщения', () => {
        it('Отправляем сообщение самому себе', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, roomID, user1.id, 'Т'.repeat(config.userLimits.messages.maxLength))
            expect(res.recipients).toEqual([user1.id])
            // }
        });
    })
    describe('Превышаем лимит', () => {
        it('Отправляем сообщение самому себе', async () => {
            // const temp = async () => {
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user1};`).send({
                "roomID": roomID,
                message: 'Т'.repeat(config.userLimits.messages.maxLength + 1)
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальная длина сообщений ${config.userLimits.messages.maxLength}`)
            // }
        });
    })

    describe('Создаём комнату', () => {
        it('Успешное создание приватной комнаты', async () => {
            const res = await request.post('/api/private-rooms/create').set('Cookie', `${cookie__value__user1};`).send({"login": user2.login})
            expect(res.status).toEqual(200)
            const room: PrivateRoomWithMessagesDTO = res.body
            roomID = room.id;
            expect(room.name).toEqual(user2.login)
            expect(room.messages).toEqual([])
            expect(room.users.length).toEqual(2)
            expect(room.users.filter((u: any) => u.login == user2.login).length).toEqual(1)
            expect(room.users.filter((u: any) => u.login == user1.login).length).toEqual(1)
        })


    })

    describe('Успешно отправляем сообщения', () => {
        it('Отправляем сообщение в приватный чат', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, roomID, user1.id, 'Т'.repeat(config.userLimits.messages.maxLength))
            // }
        });
    })
    describe('Превышаем лимит', () => {
        it('Отправляем сообщение в приватный чат', async () => {
            // const temp = async () => {
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user1};`).send({
                "roomID": roomID,
                message: 'Т'.repeat(config.userLimits.messages.maxLength + 1)
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальная длина сообщений ${config.userLimits.messages.maxLength}`)
            // }
        });
    })
});