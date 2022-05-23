import userSeeder from "../../src/seeders/userSeeder";
import userModel from "../../src/models/userModel";
import UserDto from "../../src/dtos/userDTO";
import publicRoomSeeder from "../../src/seeders/publicRoomSeeder";
import {PublicRoomDTO} from "../../src/dtos/publicRoomDTO";
import {IPrivateRoomDocument, PrivateRoomModel, PublicRoomModel} from "../../src/models/roomModel";
import {getPublicRoomByName} from "../../src/dao/publicRoomDAO";
import {PrivateRoomDto} from "../../src/dtos/privateRoomDTO";
import privateRoomSeeder from "../../src/seeders/privateRoomSeeder";


// jest.setTimeout(30000);
describe('Сеятель приватных комнат', () => {
    let users: UserDto[];
    const countUsers = 10;

    let rooms: (IPrivateRoomDocument & {_id: any})[];
    let countRooms = ((countUsers-1)+1) * (1 + countUsers) / 2
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

    describe('Создание приватных комнат', () => {
        it(`Создадим ${countRooms} приватных комнат`, async () => {
            let insertedSuccess = false;
            try {
                rooms = await privateRoomSeeder.insertPrivateRoomsByUserIDs(users.map(u=>u.id));
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Валидация созданных комнат', () => {
        let roomDocuments: any;
        it('Проверяем количество созданных документов', async () => {
            expect(rooms.length).toEqual(countRooms);
            roomDocuments = await PrivateRoomModel.find({});
            expect(roomDocuments.length).toEqual(rooms.length);
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

        it('Проверяем что есть комнаты с двумя пользователями', async () => {
            const docs = roomDocuments.filter((u: any) => u.users.length == 2);
            expect(docs.length).not.toEqual(0)
        })

    });
});