import UserDto from "../../src/dtos/userDTO";
import {request} from "../jest.setup";
import {PublicRoomWithLoginsDTO} from "../../src/dtos/publicRoomDTO";
import userSeeder from "../../src/seeders/userSeeder";
import config from "../../src/config/default"
import publicRoomService from "../../src/service/publicRoomService";

jest.setTimeout(30000);
describe('Максимальная длина сообщений', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;

    let openRoomID = ""
    let closeRoomID = ""
    let roomID = ""

    let users: UserDto[];
    const countOfUsers = config.userLimits.publicRoom.maxUsersCount;

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
    })


    describe('Создание пользователей', () => {
        it(`Создадим ${countOfUsers} пользователей`, async () => {
            let insertedSuccess = false;
            try {
                users = await userSeeder.insertUsers(countOfUsers);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Успешно добавим пользователей', () => {
        it(`Добавим ${countOfUsers - 1} пользователей в комнату`, async () => {
            let joinedSuccess = false;
            try {
                for(const user of users.slice(0, -1))
                    await publicRoomService.join("first__room","",user.id)
                joinedSuccess = true;
            } finally {
                expect(joinedSuccess).toEqual(true)
            }
        });
    });

    describe('Превышаем лимит', () => {
        it(`Добавим ещё 1 пользователя в комнату`, async () => {
            let joinedSuccess = false;
            try {
                await publicRoomService.join("first__room","",users[users.length-1].id)
                joinedSuccess = true;
            }
            catch (err:any){
                expect(err.message).toEqual(`Количество участник комнаты не может быть больше ${countOfUsers}`)
            }
            finally {
                expect(joinedSuccess).toEqual(false)
            }
        });
    });
})