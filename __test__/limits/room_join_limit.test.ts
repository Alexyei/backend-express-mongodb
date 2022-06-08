import UserDto from "../../src/dtos/userDTO";
import {PublicRoomDTO, PublicRoomWithLoginsDTO, PublicRoomWithMessagesDTO} from "../../src/dtos/publicRoomDTO";
import config from "../../src/config/default";
import {request} from "../jest.setup";
import publicRoomSeeder from "../../src/seeders/publicRoomSeeder";
import userSeeder from "../../src/seeders/userSeeder";

jest.setTimeout(300000);
describe('Максимальное количество вступлений в комнаты в день', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;

    let openRoomID = ""
    let closeRoomID = ""
    let roomID = ""

    let publicRooms: PublicRoomDTO[];
    const countPublicRoomsCreate = config.userLimits.publicRoom.publicRoomCreateInDay;
    const countPublicRoomsJoin = config.userLimits.publicRoom.publicRoomJoinInDay;
    const usersCount = countPublicRoomsJoin / countPublicRoomsCreate
    const roomsCount = countPublicRoomsCreate * usersCount
    const name = "first__room"
    let users: UserDto[];

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
        it(`Создадим ${usersCount} пользователей`, async () => {
            let insertedSuccess = false;
            try {
                users = await userSeeder.insertUsers(usersCount);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Успешно создаём публичные комнаты', () => {
        it(`Успешно создаём ${countPublicRoomsCreate}`, async () => {
            let insertedSuccess = false;
            try {
                publicRooms = await publicRoomSeeder.insertPublicRoomsByUserIDsWithJoin(countPublicRoomsCreate, users.map(u=>u.id), "");
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        })
    })

    describe('Успешно вступаем в комнаты',()=>{
        it(`Успешно входим в ${roomsCount} комнат`,async ()=>{
            for(const room of publicRooms){
                const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"name":room.name})
                expect(res.status).toEqual(200)
            }
        })
    })

    describe('Создаём ещё одну комнату',()=>{

        it('Успешное создание комнаты без пароля', async ()=>{
            const res = await request.post('/api/public-rooms/create').set('Cookie', `${cookie__value__user2};`).send({"name":name})
            expect(res.status).toEqual(200)
        })
    })

    describe('Превышаем лимит',()=>{
        it('Пробуем войти ещё в одну комнату',async ()=>{
            const res = await request.post('/api/public-rooms/join').set('Cookie', `${cookie__value__user1};`).send({"name":name})
            expect(res.status).toEqual(400)
            expect(res.body.message).toEqual("Достигнут дневной лимит вступления в публичные комнаты")
        })
    })
})