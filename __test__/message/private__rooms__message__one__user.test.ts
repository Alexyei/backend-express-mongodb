import {request} from "../jest.setup";
import UserDto from "../../src/dtos/userDTO";
import messageService from "../../src/service/messageService";
import ApiError from "../../src/exceptions/ApiError";
import {PublicRoomWithLoginsDTO, PublicRoomWithMessagesDTO} from "../../src/dtos/publicRoomDTO";
import MessageDTO from "../../src/dtos/messageDTO";
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

async function successCheckPrivateRoomMessage(cookie: string, roomID: string) {
    const res = await request.get(`/api/private-room/room-messages/${roomID}`).set('Cookie', `${cookie};`).send();
    expect(res.status).toEqual(200)
    const data: PublicRoomWithMessagesDTO = res.body;
    expect(data.id).toEqual(roomID)
    return data;
}

async function successCheckPrivateRoomMessages(cookie: string) {
    const res = await request.get(`/api/private-room/rooms-messages`).set('Cookie', `${cookie};`).send();
    expect(res.status).toEqual(200)
    const data: PublicRoomWithMessagesDTO[] = res.body;
    return data;
}


describe('Отправка сообщений в приватной комнате', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;
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

    describe('Валидация отправки сообщений', () => {
        it('Отправляем сообщение в несуществующую комнату', async () => {
            // В данном тесте мы не используем error middleware поэтому, чтобы получить ошибку ApiError, а не другого типа, нужно пройти валидацию идентификаторов mongoose
            const roomID = '1'.repeat(24);

            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user1};`).send({
                "roomID": roomID,
                message: 'Текст сообщения'
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Комнаты с id ${roomID} не существует!`)
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

    describe('Валидация отправки сообщений в комнату в которой не состоим', () => {
        it('Отправляем сообщение в комнату в которой не состоим', async () => {
            // В данном тесте мы не используем error middleware поэтому, чтобы получить ошибку ApiError, а не другого типа, нужно пройти валидацию идентификаторов mongoose

            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user2};`).send({
                "roomID": roomID,
                message: 'Текст сообщения'
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Вы не являетесь участником комнаты!`)
        });
    })

    describe('Успешно отправляем сообщения', () => {
        it('Отправляем сообщение в комнату', async () => {
            const res = await successSendMessage(cookie__value__user1, roomID, user1.id, 'Первый 1')
            expect(res.recipients.length).toEqual(1)
            expect(res.recipients.includes(user1.id)).toEqual(true)
        });

        it('Повторно отправляем сообщение в комнату', async () => {
            const res = await successSendMessage(cookie__value__user1, roomID, user1.id, 'Первый 2')
            expect(res.recipients.length).toEqual(1)
            expect(res.recipients.includes(user1.id)).toEqual(true)
        });
    })

    describe('Проверяем сообщения первого пользователя', () => {
        it('Проверяем сообщения для одной комнаты', async () => {
            const data = await successCheckPrivateRoomMessage(cookie__value__user1, roomID);
            expect(data.messages.length).toEqual(2)
            data.messages.forEach((m) => expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('Первый')).toEqual(true))
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const data = await successCheckPrivateRoomMessages(cookie__value__user1);
            expect(data.length).toEqual(1)
            data.forEach(el => el.messages.forEach(m => expect(m.author.login).toEqual(user1.login)));
        })
    })

    describe('Проверяем сообщения второго пользователя', () => {
        it('Проверяем сообщения для одной комнаты', async () => {
            const res = await request.get(`/api/private-room/room-messages/${roomID}`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Вы не являетесь участником комнаты!`)
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const data = await successCheckPrivateRoomMessages(cookie__value__user2);
            expect(data.length).toEqual(0)
        })
    })
});