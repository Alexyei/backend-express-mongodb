import {request} from "../../jest.setup";
import UserDto from "../../../src/dtos/userDTO";
import {PublicRoomWithLoginsDTO, PublicRoomWithMessagesDTO} from "../../../src/dtos/publicRoomDTO";
import MessageDTO, {MessageDTOShort} from "../../../src/dtos/messageDTO";
import messagesSeeder from "../../../src/seeders/messagesSeeder";


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

describe('Отправка сообщений в публичных комнатах lazy', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;

    let openRoom: PublicRoomWithLoginsDTO;
    let closeRoom: PublicRoomWithLoginsDTO;
    const countMessageByUserByRoom = 2;
    let messages: MessageDTO[];
    let messagesOpenRoom: MessageDTOShort[];
    let messagesCloseRoom: MessageDTOShort[];

    let limit = 2;
    let nin:string[] = [];
    let first_from:string;
    let from:string
    let sentMessages: MessageDTO[];
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
            const data: PublicRoomWithLoginsDTO = openRoom = res.body;
            expect(data.name).toEqual(name)
            expect(data.owner.login).toEqual(user1.login)
            expect(data.password).toEqual(false)
            expect(data.users).toEqual([{login: user1.login}])
        })

        it('Успешное создание комнаты c паролем', async () => {
            const name = "second__room";
            const password = "12345";
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user1};`).send({
                "password": password,
                "name": name
            })
            expect(res.status).toEqual(200)
            const data: PublicRoomWithLoginsDTO = closeRoom = res.body;
            expect(data.name).toEqual(name)
            expect(data.owner.login).toEqual(user1.login)
            expect(data.password).toEqual(true)
            expect(data.users).toEqual([{login: user1.login}])
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

    describe('Создание сообщений', () => {
        it(`Создадим ${countMessageByUserByRoom} сообщений в каждой комнате каждого пользователя`, async () => {
            let insertedSuccess = false;
            try {
                messages = await messagesSeeder.createMessagesInPublicRoomsByUserIDs(countMessageByUserByRoom, [user1.id, user2.id])
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
                from = new Date().toISOString()
            }
        });
    });

    describe('Валидация получения сообщений в режиме lazy',()=>{

        it('Отправляем запрос без сессии',async ()=>{
            const res = await request.post(`/api/messages/lazy`).send();
            expect(res.status).toEqual(401)
            expect(res.body.message).toEqual(`Пользователь не авторизован`)
        })

        it('Отправляем запрос без параметров',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send();
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос без limit',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос без from',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                nin,
                limit
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Метка времени должна содержать 24 символов`)
        })
        it('Отправляем запрос без nin',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                limit
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual('Поле nin не является массивом')
        })
        it('Отправляем запрос некорректным limit (min)',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin,
                limit: -1
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос некорректным limit (max)',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin,
                limit: 501
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос с некорректной длиной from',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                nin,
                limit,
                from: "1"
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Метка времени должна содержать 24 символов`)
        })
        it('Отправляем запрос с некорректным from',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                nin,
                limit,
                from: "a".repeat(24)
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Требуемый формат метки времени (.toISOString): 2022-05-16T16:11:38.537Z`)
        })
        it('Отправляем запрос c nin не массивом',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin:"abc",
                limit
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Поле nin не является массивом`)
        })
        it('Отправляем запрос c nin c не id (число)',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin: [messages[0].id,123],
                limit
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Поле nin должно содержать только идентификаторы`)
        })
        it('Отправляем запрос c nin c не id (длина строки)',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin: [messages[0].id,"1".repeat(23)],
                limit
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Поле nin должно содержать только идентификаторы`)
        })
        it('Отправляем запрос c nin некорректный id',async ()=>{
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                from,
                nin: [messages[0].id,"1".repeat(24)],
                limit
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Сообщение с таким id не найдено`)
        })
    })

    describe('Получаем сообщания в режиме lazy', () => {
        it('Получаем сообщения для комнаты с паролем', async () => {
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                limit,
                from,
                nin
            });
            expect(res.status).toEqual(200)
            messagesCloseRoom = res.body;
            expect(res.body.length).toEqual(limit)
            const a = res.body.map((m:any)=>m.createdAt.toString())
            const b = messagesCloseRoom[0].createdAt>=messagesCloseRoom[1].createdAt
            const c = 2;
        })

        it('Проверяем что сообщения отсортирвоаны по дате (с паролем)',()=>{
            expect(messagesCloseRoom.every((v,i,a) => !i || a[i-1].createdAt <= v.createdAt)).toEqual(true)
        })

        it('Проверяем сообщения для комнаты без пароля', async () => {
            const res = await request.post(`/api/messages/lazy/`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: openRoom.id,
                limit,
                from,
                nin
            });
            expect(res.status).toEqual(200)
            messagesOpenRoom = res.body;
            expect(res.body.length).toEqual(limit)
        })

        it('Проверяем что сообщения отсортирвоаны по дате (без пароля)',()=>{
            expect(messagesOpenRoom.every((v,i,a) => !i || a[i-1].createdAt <= v.createdAt)).toEqual(true)
        })
    })

    describe('Успешно отправляем сообщения вторым пользователем', () => {
        sentMessages = [];
        first_from= new Date().toISOString()
        it('Отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, closeRoom.id, user2.id, 'Первое сообщение😀! с паролем')
            sentMessages.push(res)
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

        it('Повторно отправляем сообщение в комнату (с паролем)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, closeRoom.id, user2.id, 'Второе сообщение😀! с паролем')
            sentMessages.push(res)
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

        it('Отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, openRoom.id, user2.id, 'Первое сообщение😀! без пароля')
            sentMessages.push(res)
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }
        });

        it('Повторно отправляем сообщение в комнату (без пароля)', async () => {
            // const temp = async () => {
            const res = await successSendMessage(cookie__value__user2, openRoom.id, user2.id, 'Второе сообщение😀! без пароля')
            sentMessages.push(res)
            expect(res.recipients.includes(user1.id)).toEqual(true)
            expect(res.recipients.includes(user2.id)).toEqual(true)
            // }

        });

    })

    describe('Получаем вторую партию сообщений', () => {
        let messagesSecondOpenRoom: MessageDTOShort[];
        let messagesSecondCloseRoom: MessageDTOShort[];

        it('Получаем сообщения для комнаты без пароля', async () => {
            const from = messagesOpenRoom[0].createdAt.slice(0,24)
            nin = [messagesOpenRoom[0].id]
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`)
                // .field('roomID',openRoom.id)
                // .field('limit',limit)
                // .field('from',from)
                // .field('nin[0]',nin[0])
                .send({
                roomID: openRoom.id,
                    nin,
                limit,
                from,

            });
            expect(res.status).toEqual(200)
            messagesSecondOpenRoom = res.body;
            expect(res.body.length).toEqual(limit)
        })

        it('Получаем сообщения для комнаты с паролем', async () => {
            const from = messagesCloseRoom[0].createdAt.slice(0,24)
            nin = [messagesCloseRoom[0].id]
            const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                roomID: closeRoom.id,
                limit,
                from,
                nin
                // 'nin[0]':nin[0]
            });
            expect(res.status).toEqual(200)
            messagesSecondCloseRoom = res.body;
            expect(res.body.length).toEqual(limit)
        })



        it('Проверяем что в партии нет только что вставленных сообщения (без пароля)', async () => {
            expect(messagesSecondOpenRoom.every(m=>!sentMessages.map(m=>m.id).includes(m.id))).toEqual(true)
        })
        it('Проверяем что в партии нет только что вставленных сообщения (с паролем)', async () => {
            expect(messagesSecondCloseRoom.every(m=>!sentMessages.map(m=>m.id).includes(m.id))).toEqual(true)
        })

        it('Проверяем что в партии нет сообщений из первой партии (без пароля)', async () => {
            expect(messagesSecondOpenRoom.every(m=>!messagesOpenRoom.map(m=>m.id).includes(m.id))).toEqual(true)
        })
        it('Проверяем что в партии нет сообщений из первой партии (с паролем)', async () => {
            expect(messagesSecondCloseRoom.every(m=>!messagesCloseRoom.map(m=>m.id).includes(m.id))).toEqual(true)
        })
        it('Проверяем что сообщения отсортированы по дате (без пароля)', async () => {
            expect(messagesSecondOpenRoom.every((v,i,a) => !i || a[i-1].createdAt <= v.createdAt)).toEqual(true)

        })
        it('Проверяем что сообщения отсортированы по дате (с паролем)', async () => {
            expect(messagesSecondCloseRoom.every((v,i,a) => !i || a[i-1].createdAt <= v.createdAt)).toEqual(true)
        })
        it('Проверяем что сообщения старше первой партии (без пароля)', async () => {
            const oldest = messagesOpenRoom[0].createdAt
            expect(messagesSecondOpenRoom.every(m=>m.createdAt<=oldest)).toEqual(true)
        })
        it('Проверяем что сообщения старше первой партии (с паролем)', async () => {
            const oldest = messagesCloseRoom[0].createdAt
            expect(messagesSecondCloseRoom.every(m=>m.createdAt<=oldest)).toEqual(true)
        })
    })

    describe('Получаем все сообщения',()=>{


        const all_messages:MessageDTOShort[] = []
        it('Проверяем что получили все сообщения',async ()=>{
            let current_messages:MessageDTOShort[]
            let from_current = from;
            let nin:string[] = []
            while(true){
                const res = await request.post(`/api/messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                    roomID: closeRoom.id,
                    limit,
                    from: from_current,
                    nin
                    // 'nin[0]':nin[0]
                });
                expect(res.status).toEqual(200)
                current_messages = res.body;
                if (!current_messages.length)
                    break;
                from_current = current_messages[0].createdAt.slice(0,24)
                nin = current_messages.filter(m=>m.createdAt.slice(0,24)==from_current).map(m=>m.id)
                all_messages.push(...current_messages)
            }

            expect(messages.length/2).toEqual(all_messages.length)
        })
    })
});