import {request} from "../../jest.setup";
import UserDto from "../../../src/dtos/userDTO";
import MessageDTO from "../../../src/dtos/messageDTO";
import messagesSeeder from "../../../src/seeders/messagesSeeder";
import userSeeder from "../../../src/seeders/userSeeder";
import privateRoomSeeder from "../../../src/seeders/privateRoomSeeder";
import {IPrivateRoomDocument} from "../../../src/models/roomModel";
import {PrivateRoomWithMessagesLazyDTO} from "../../../src/dtos/privateRoomDTO";

// jest.setTimeout(30000);
describe('Отправка сообщений в приватных комнатах lazy', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;
    let users: UserDto[];
    const userCount = 5;
    const countRoomsByUser = 5;
    let rooms: (IPrivateRoomDocument & {_id: any})[];
    const countMessageByUserByRoom = 2;
    let messages: MessageDTO[];
    let from: string;
    let nin: string[] = [];
    const roomsLimit = 5;
    const messagesLimit = 5;

    let result: PrivateRoomWithMessagesLazyDTO[];
    let second_result: PrivateRoomWithMessagesLazyDTO[];

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

    describe('Создание пользователей', () => {
        it(`Создадим ${userCount} пользователей`, async () => {
            let insertedSuccess = false;
            try {
                users = await userSeeder.insertUsers(userCount);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });
    describe('Создание приватных комнат', () => {
        it(`Создадим ${countRoomsByUser} приватных комнат`, async () => {
            let insertedSuccess = false;
            try {
                rooms = await privateRoomSeeder.insertPrivateRoomsByUserIDs([user1.id, ...users.map(u => u.id)]);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });
    describe('Создание сообщений', () => {
        it(`Создадим ${countMessageByUserByRoom} сообщений в каждой комнате каждого пользователя`, async () => {
            let insertedSuccess = false;
            try {
                messages = await messagesSeeder.createMessagesInPrivateRoomsByUserIDs(countMessageByUserByRoom, [user1.id, ...users.map(u => u.id.toString())])
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
                from = new Date().toISOString()
            }
        });
    });


    describe('Валидация получения комнат в режиме lazy',()=>{

        it('Отправляем запрос без сессии',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).send();
            expect(res.status).toEqual(401)
            expect(res.body.message).toEqual(`Пользователь не авторизован`)
        })

        it('Отправляем запрос без параметров',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send();
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество комнат ${50}, минимальное ${1}`)
        })
        it('Отправляем запрос без roomsLimit',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                messagesLimit,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество комнат ${50}, минимальное ${1}`)
        })
        it('Отправляем запрос без messagesLimit',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос без from',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Метка времени должна содержать 24 символов`)
        })
        it('Отправляем запрос без nin',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual('Поле nin не является массивом')
        })
        it('Отправляем запрос некорректным roomsLimit (min)',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit:-1,
                messagesLimit,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество комнат ${50}, минимальное ${1}`)
        })
        it('Отправляем запрос некорректным roomsLimit (max)',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit:51,
                messagesLimit,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество комнат ${50}, минимальное ${1}`)
        })
        it('Отправляем запрос некорректным messagesLimit (min)',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit:0,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос некорректным messagesLimit (max)',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit:501,
                from,
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос с некорректной длиной from',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from:"1",
                nin
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Метка времени должна содержать 24 символов`)
        })
        it('Отправляем запрос с некорректным from',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                nin,
                from: "a".repeat(24)
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Требуемый формат метки времени (.toISOString): 2022-05-16T16:11:38.537Z`)
        })
        it('Отправляем запрос c nin не массивом',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
                nin:"abc",
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Поле nin не является массивом`)
        })
        it('Отправляем запрос c nin c не id (число)',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
                nin: [messages[0].id,123],
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Поле nin должно содержать только идентификаторы`)
        })
        it('Отправляем запрос c nin c не id (длина строки)',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
                nin: [messages[0].id,"1".repeat(23)],
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Поле nin должно содержать только идентификаторы`)
        })
        it('Отправляем запрос c nin некорректный id',async ()=>{
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
                nin: [messages[0].id,"1".repeat(24)],
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Комната с таким id не найдена`)
        })
    })

    describe('Валидация получения комнты в режиме lazy',()=>{

        it('Отправляем запрос без сессии',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).send();
            expect(res.status).toEqual(401)
            expect(res.body.message).toEqual(`Пользователь не авторизован`)
        })

        it('Отправляем запрос без параметров',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send();
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос без anotherUserID',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                messagesLimit,
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`anotherUserID обязателен`)
        })
        it('Отправляем запрос без messagesLimit',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                anotherUserID:user1.id,
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос некорректным messagesLimit (min)',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                anotherUserID:user1.id,
                messagesLimit:0,
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос некорректным messagesLimit (max)',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                anotherUserID:user1.id,
                messagesLimit:501,
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Максимальное количество сообщений ${500}, минимальное ${1}`)
        })
        it('Отправляем запрос с некорректной длиной anotherUserID',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                anotherUserID:"1".repeat(23),
                messagesLimit,
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Длина идентификатора 24 символа`)
        })
        it('Отправляем запрос с некорректным anotherUserID',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                messagesLimit,
                anotherUserID: "a".repeat(24)
            });
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual(`Пользователь с таким anotherUserID не найден`)
        })
        it('Отправляем запрос для несуществующей комнаты',async ()=>{
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user2};`).send({
                messagesLimit,
                anotherUserID: user1.id
            });
            expect(res.status).toEqual(200)
            expect(res.body).toEqual("")
        })
    })

    describe('Получаем комнаты с сообщения в режиме lazy', () => {

        it('Получаем топ комнат по дате последнего сообщения пользователя', async () => {
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
                nin
            });
            expect(res.status).toEqual(200)
            result = res.body;
            expect(result.length).toBeLessThanOrEqual(roomsLimit)
            expect(result.every(r => r.messages.length <= messagesLimit)).toEqual(true)
        })

        it('Проверяем что сообщения отсортирвоаны по дате', () => {
            expect(result.every(r => r.messages.every((v, i, a) => !i || a[i - 1].createdAt <= v.createdAt))).toEqual(true)
        })

        it('Проверяем что комнаты отсортирвоаны по дате', () => {
            expect(result.every((v, i, a) => !i || a[i - 1].lastMessage >= v.lastMessage)).toEqual(true)
        })

        it('Проверяем что нет более новых сообщений', () => {
            // const a = messages.filter(m=>result.map(r=>r.id).includes(m.room)).map(m=>m.createdAt.toISOString()).sort()
            // const b = result[0].lastMessage;
            // // expect(messages.filter(m=>result.map(r=>r.id).includes(m.room)).every(m=>m.createdAt>=result[0].lastMessage)).toEqual(true)
            // const c = result.map(r=>messages.filter(m=>m.room==r.id).map(m=>m.createdAt.toISOString()))
            // const d = result.map(r=>r.lastMessage)
            expect(result.every(r => messages.filter(m => m.room == r.id).every(m => m.createdAt.toISOString() <= r.lastMessage))).toEqual(true)
        })
    })
    describe('Получаем комнату с сообщения в режиме lazy', () => {
        it('Получаем топ комнат по дате последнего сообщения пользователя', async () => {
            // const mess = messages.filter(m=>m.recipients.includes(user1.id) && m.recipients.length==2)
            // const another = result.map(r=>({...r,messages:r.messages.filter(m=>mess.map(mm=>mm.id).includes(m.id))}))
            //
            const another = messages.filter(m=>m.id == result[0].messages[3].id)[0].recipients.filter(id=>user1.id!=id)[0]
            const res = await request.post(`/api/private-room/room-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                anotherUserID:another,
                messagesLimit,
            });
            expect(res.status).toEqual(200)
            const data:PrivateRoomWithMessagesLazyDTO = res.body;
            expect(data.messages.length <= messagesLimit).toEqual(true)
            // const a = result.filter(r=>r.id==data.id)[0];
            // const b = room.id.toString()

            expect(data.messages.every((v,i,a)=>result[0].messages[i].id == v.id)).toEqual(true)
        })
    })


    describe('Получаем комнаты с сообщения в режиме lazy (вторая партия)', () => {

        it('Получаем топ комнат по дате последнего сообщения пользователя', async () => {
            from = result[result.length-1].lastMessage
            nin = result.filter(r => r.lastMessage == from).map(r => r.id)
            const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                roomsLimit,
                messagesLimit,
                from,
                nin
            });
            expect(res.status).toEqual(200)
            second_result = res.body;
            expect(second_result.length).toBeLessThanOrEqual(roomsLimit)
            expect(second_result.every(r => r.messages.length <= messagesLimit)).toEqual(true)
        })

        it('Проверяем что сообщения отсортирвоаны по дате (сначала старые)', () => {
            expect(second_result.every(r => r.messages.every((v, i, a) => !i || a[i - 1].createdAt <= v.createdAt))).toEqual(true)
        })

        it('Проверяем что комнаты отсортирвоаны по дате (сначала новые)', () => {
            expect(second_result.every((v, i, a) => !i || a[i - 1].lastMessage >= v.lastMessage)).toEqual(true)
        })

        it('Проверяем что нет повторов из первой партии', () => {
            expect(second_result.every(r => !result.map(r => r.id).includes(r.id))).toEqual(true)
        })

        it('Проверяем что сообщения из певой партии раньше', () => {
            expect(second_result[0].lastMessage <= result[0].lastMessage).toEqual(true)
        })
    })
    describe('Получаем комнаты с сообщения в режиме lazy (все)', () => {
        let all_rooms: PrivateRoomWithMessagesLazyDTO[]= [];

        it('Получаем топ комнат по дате последнего сообщения пользователя', async () => {
            let from = new Date().toISOString()
            let nin:string[] = []
            while (true) {
                const res = await request.post(`/api/private-rooms/rooms-messages/lazy`).set('Cookie', `${cookie__value__user1};`).send({
                    roomsLimit,
                    messagesLimit,
                    from,
                    nin
                });
                expect(res.status).toEqual(200)
                let result:PrivateRoomWithMessagesLazyDTO[] = res.body;
                const a = result.map(r=>r.id)
                expect(result.length).toBeLessThanOrEqual(roomsLimit)
                expect(result.every(r => r.messages.length <= messagesLimit)).toEqual(true)
                if (!result.length)
                    break;
                from = result[result.length-1].lastMessage
                nin = result.filter(r => r.lastMessage == from).map(r => r.id)
                all_rooms.push(...result)
            }

            const c = all_rooms.map(r=>r.lastMessage)
            expect(all_rooms.length).toEqual(rooms.filter(r=>r.users.includes(user1.id)).length)
        })

    })
});
