import {request} from "../jest.setup";
import UserDto from "../../src/dtos/userDTO";
import messageService from "../../src/service/messageService";
import ApiError from "../../src/exceptions/ApiError";
import {PublicRoomWithLoginsDTO, PublicRoomWithMessagesDTO} from "../../src/dtos/publicRoomDTO";
import MessageDTO from "../../src/dtos/messageDTO";


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

async function successCheckPublicRoomMessage(cookie: string, roomID: string) {
    const res = await request.get(`/api/public-room/room-messages/${roomID}`).set('Cookie', `${cookie};`).send();
    expect(res.status).toEqual(200)
    const data: PublicRoomWithMessagesDTO = res.body;
    expect(data.id).toEqual(roomID)
    return data;
}

async function successCheckPublicRoomMessages(cookie: string) {
    const res = await request.get(`/api/public-room/rooms-messages`).set('Cookie', `${cookie};`).send();
    expect(res.status).toEqual(200)
    const data: PublicRoomWithMessagesDTO[] = res.body;
    return data;
}


describe('Отправка сообщений в публичных комнатах', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;

    let openRoomID = ""
    let closeRoomID = ""
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
            // const temp = async () => {
            // const res = await messageService.create(roomID, user1.id, 'Текст сообщения')
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user1};`).send({
                "roomID": roomID,
                message: 'Текст сообщения'
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Комнаты с id ${roomID} не существует!`)
            // }
            // await expect(temp).rejects.toThrow(ApiError)
            // await expect(temp).rejects.toThrow(`Комнаты с id ${roomID} не существует!`)
        });
    })

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

    describe('Валидация отправки сообщений в комнату в которой не состоим', () => {
        it('Отправляем сообщение в комнату в которой не состоим (с паролем)', async () => {
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user2};`).send({
                "roomID": closeRoomID,
                message: 'Текст сообщения'
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Вы не являетесь участником комнаты!`)
        });

        it('Отправляем сообщение в комнату в которой не состоим (без пароля)', async () => {
            const res = await request.post('/api/messages/create').set('Cookie', `${cookie__value__user2};`).send({
                "roomID": closeRoomID,
                message: 'Текст сообщения'
            })
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Вы не являетесь участником комнаты!`)
        });
    })

    describe('Успешно отправляем сообщения', () => {
        it('Отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, closeRoomID, user1.id, 'Первое сообщение😀! с паролем')
            expect(res.recipients).toEqual([user1.id])
            // }
        });

        it('Повторно отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, closeRoomID, user1.id, 'Второе сообщение😀! с паролем')
            expect(res.recipients).toEqual([user1.id])
            // }
        });

        it('Отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, openRoomID, user1.id, 'Первое сообщение😀! без пароля')
            expect(res.recipients).toEqual([user1.id])
            // }
        });

        it('Повторно отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user1, openRoomID, user1.id, 'Второе сообщение😀! без пароля')
            expect(res.recipients).toEqual([user1.id])
            // }
        });

    })

    describe('Проверяем сообщения первого пользователя', () => {
        it('Проверяем сообщения для комнаты с паролем', async () => {
            const data = await successCheckPublicRoomMessage(cookie__value__user1, closeRoomID);
            expect(data.messages.length).toEqual(2)
            data.messages.forEach((m) => expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('с паролем')).toEqual(true))
        })

        it('Проверяем сообщения для комнаты без пароля', async () => {
            const data = await successCheckPublicRoomMessage(cookie__value__user1, openRoomID);
            expect(data.messages.length).toEqual(2)
            data.messages.forEach((m) => expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('без пароля')).toEqual(true))
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const data = await successCheckPublicRoomMessages(cookie__value__user1);
            expect(data.length).toEqual(2)
            data.forEach(el => el.messages.forEach(m => expect(m.author.login).toEqual(user1.login)));
        })
    })

    describe('Проверяем сообщения второго пользователя', () => {
        it('Проверяем сообщения для комнаты с паролем', async () => {
            const res = await request.get(`/api/public-room/room-messages/${closeRoomID}`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Вы не являетесь участником комнаты c id ${closeRoomID}!`)
        })

        it('Проверяем сообщения для комнаты без пароля', async () => {
            const res = await request.get(`/api/public-room/room-messages/${openRoomID}`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Вы не являетесь участником комнаты c id ${openRoomID}!`)
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const res = await request.get(`/api/public-room/rooms-messages`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(200)
            const data: PublicRoomWithMessagesDTO[] = res.body;
            expect(data.length).toEqual(0)
        })
    })

    describe('Второй пользователь входит в комнаты', () => {
        it('Вход в комнату без пароля', async () => {
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user2};`).send({"name": "first__room"})
            expect(res.status).toEqual(200)
            const data: PublicRoomWithMessagesDTO = res.body;
            expect(data.password).toEqual(false)
            expect(data.owner.login).toEqual(user1.login)
            expect(data.users.length).toEqual(2)
            expect(data.users.filter((u: any) => u.login == user1.login).length).toEqual(1)
            expect(data.users.filter((u: any) => u.login == user2.login).length).toEqual(1)
            expect(data.messages).toEqual([])
        })

        it('Вход в комнату c паролем', async () => {
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user2};`).send({
                "name": "second__room",
                "password": "12345"
            })
            expect(res.status).toEqual(200)
            const data: PublicRoomWithMessagesDTO = res.body;
            expect(data.password).toEqual(true)
            expect(data.owner.login).toEqual(user1.login)
            expect(data.users.length).toEqual(2)
            expect(data.users.filter((u: any) => u.login == user1.login).length).toEqual(1)
            expect(data.users.filter((u: any) => u.login == user2.login).length).toEqual(1)
            expect(data.messages).toEqual([])
        })
    })

    describe('Проверяем сообщения второго пользователя', () => {
        it('Проверяем сообщения для комнаты с паролем', async () => {
            const res = await request.get(`/api/public-room/room-messages/${closeRoomID}`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(200)
            expect(res.body.messages.length).toEqual(0)
        })

        it('Проверяем сообщения для комнаты без пароля', async () => {
            const res = await request.get(`/api/public-room/room-messages/${openRoomID}`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(200)
            expect(res.body.messages.length).toEqual(0)
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const res = await request.get(`/api/public-room/rooms-messages`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(200)
            const data: PublicRoomWithMessagesDTO[] = res.body;
            expect(data.length).toEqual(2)
            data.forEach(el => expect(el.messages.length).toEqual(0))
        })
    })

    describe('Успешно отправляем сообщения вторым пользователем', () => {
        it('Отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, closeRoomID, user2.id, 'Первое сообщение😀! с паролем')
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

        it('Повторно отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, closeRoomID, user2.id, 'Второе сообщение😀! с паролем')
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

        it('Отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, openRoomID, user2.id, 'Первое сообщение😀! без пароля')
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

        it('Повторно отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, openRoomID, user2.id, 'Второе сообщение😀! без пароля')
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

    })

    describe('Проверяем сообщения первого пользователя', () => {
        it('Проверяем сообщения для комнаты с паролем', async () => {
            const data = await successCheckPublicRoomMessage(cookie__value__user1, closeRoomID);
            expect(data.messages.length).toEqual(4)
            // data.messages.forEach((m)=>expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('с паролем')).toEqual(true))
        })

        it('Проверяем сообщения для комнаты без пароля', async () => {
            const data = await successCheckPublicRoomMessage(cookie__value__user1, openRoomID);
            expect(data.messages.length).toEqual(4)
            // data.messages.forEach((m)=>expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('без пароля')).toEqual(true))
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const data = await successCheckPublicRoomMessages(cookie__value__user1);
            expect(data.length).toEqual(2)
            data.forEach(el => expect(el.messages.length).toEqual(4))
        })
    })

    describe('Проверяем сообщения второго пользователя', () => {
        it('Проверяем сообщения для комнаты с паролем', async () => {
            const data = await successCheckPublicRoomMessage(cookie__value__user2, closeRoomID);
            expect(data.messages.length).toEqual(2)
            // data.messages.forEach((m)=>expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('с паролем')).toEqual(true))
        })

        it('Проверяем сообщения для комнаты без пароля', async () => {
            const data = await successCheckPublicRoomMessage(cookie__value__user2, openRoomID);
            expect(data.messages.length).toEqual(2)
            // data.messages.forEach((m)=>expect(m.author.login).toEqual(user1.login))
            data.messages.forEach((m) => expect(m.message.includes('без пароля')).toEqual(true))
        })

        it('Проверяем сообщения для всех комнат', async () => {
            const data = await successCheckPublicRoomMessages(cookie__value__user2);
            expect(data.length).toEqual(2)
            data.forEach(el => expect(el.messages.length).toEqual(2))
        })
    })
});