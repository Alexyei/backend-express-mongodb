import userSeeder from "../../src/seeders/userSeeder";
import userModel from "../../src/models/userModel";
import UserDto from "../../src/dtos/userDTO";
import publicRoomSeeder from "../../src/seeders/publicRoomSeeder";
import {PublicRoomDTO} from "../../src/dtos/publicRoomDTO";
import {PublicRoomModel} from "../../src/models/roomModel";
import {getPublicRoomByName} from "../../src/dao/publicRoomDAO";


// jest.setTimeout(30000);
describe('Сеятель публичных комнат', () => {
    let users: UserDto[];
    const countUsers = 10;

    let rooms: PublicRoomDTO[];
    const countRoomsByUser = 20;
    describe('Создание пользователей', () => {
        it(`Создадим ${countUsers} пользователей`, async () => {
            let insertedSuccess = false;
            try {
                users = await userSeeder.insertUsers(countUsers);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Создание публичных комнат без пароля', () => {
        it(`Создадим ${countRoomsByUser} публичных комнат`, async () => {
            let insertedSuccess = false;
            try {
                rooms = await publicRoomSeeder.insertPublicRoomsByUserIDsWithJoin(countRoomsByUser, users.map(u=>u.id),"");
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Валидация созданных комнат', () => {
        let roomDocuments: any;
        it('Проверяем количество созданных документов', async () => {
            expect(rooms.length).toEqual(countRoomsByUser*countUsers);
            roomDocuments = await PublicRoomModel.find({});
            expect(roomDocuments.length).toEqual(countRoomsByUser*countUsers);
        })

        it('Проверяем уникальность названий комнат', async () => {
            expect(new Set(roomDocuments.map((u: any) => u.name)).size).toEqual(countRoomsByUser*countUsers)
        })

        it('Проверяем что все возвращённые id есть в документах', async () => {
            const docs_ids = roomDocuments.map((u: any) => u._id.toString())
            const seeder_ids = rooms.map(u=>u.id.toString())
            expect(docs_ids.every((id: any) => seeder_ids.includes(id))).toEqual(true)
        })

        it('Проверяем что есть комнаты с одним пользователем', async () => {
            const docs = roomDocuments.filter((u: any) => u.users.length == 1);
            expect(docs.length).not.toEqual(0)
        })

        it('Проверяем что есть комнаты со всеми пользователями', async () => {
            const docs = roomDocuments.filter((u: any) => u.users.length == countUsers);
            expect(docs.length).not.toEqual(0)
        })

        it('Проверяем что все комнаты без пароля',async()=>{
            const res =await Promise.all(rooms.map(async (r) => await getPublicRoomByName(r.name)))
            expect(res.every(r=>r && r.password === null)).toEqual(true)
        })
    });
});