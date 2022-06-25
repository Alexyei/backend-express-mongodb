import UserDto from "../../src/dtos/userDTO";
import config from "../../src/config/default";
import {request} from "../jest.setup";
import publicRoomSeeder from "../../src/seeders/publicRoomSeeder";
import {PublicRoomDTO} from "../../src/dtos/publicRoomDTO";
import privateRoomSeeder from "../../src/seeders/privateRoomSeeder";

jest.setTimeout(30000)
describe('Максимальное количество новых комнат в день', () => {

    let cookie__value__user1 = ""
    let user1: UserDto;
    let cookie__value__user2 = ""
    let user2: UserDto;

    let openRoomID = ""
    let closeRoomID = ""
    let roomID = ""

    let publicRooms: PublicRoomDTO[];
    let privateRooms: any;
    const countPublicRooms = config.userLimits.publicRoom.publicRoomCreateInDay;
    const countPrivateRooms = config.userLimits.privateRoom.privateRoomCreateInDay;

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
    });

    describe('Успешно создаём публичные комнаты',()=>{
        it(`Успешно создаём ${countPublicRooms}`, async () => {
            let insertedSuccess = false;
            try {
                publicRooms = await publicRoomSeeder.insertPublicRoomsByUserIDsWithJoin(countPublicRooms, [user1.id],"", false);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        })
    })

    describe('Превышаем лимит',()=>{
        it(`Пробуем создать ещё одну комнату`, async () => {
            let insertedSuccess = false;
            try {
                publicRooms = await publicRoomSeeder.insertPublicRoomsByUserIDsWithJoin(1, [user1.id],"", false);
                insertedSuccess = true;
            }
            catch (err:any){
                expect(err.message).toEqual("Достигнут дневной лимит создания публичных комнат")
            }
            finally {
                expect(insertedSuccess).toEqual(false)
            }
        })
    })

    describe('Успешно создаём приватные комнаты',()=>{
        it(`Успешно создаём ${countPrivateRooms}`, async () => {
            let insertedSuccess = false;
            try {
                privateRooms = await privateRoomSeeder.insertPrivateRoomsByUserID(user1.id, countPrivateRooms);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        })
    })

    describe('Превышаем лимит',()=>{
        it(`Пробуем создать ещё одну комнату`, async () => {
            let insertedSuccess = false;
            try {
                privateRooms = await privateRoomSeeder.insertPrivateRoomsByUserID(user1.id, 1);
                insertedSuccess = true;
            }
            catch (err:any){
                expect(err.message).toEqual("Достигнут дневной лимит создания приватных комнат")
            }
            finally {
                expect(insertedSuccess).toEqual(false)
            }
        })
    })
});