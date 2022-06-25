import userSeeder from "../../src/seeders/userSeeder";
import UserDto from "../../src/dtos/userDTO";
import publicRoomSeeder from "../../src/seeders/publicRoomSeeder";
import {PublicRoomDTO} from "../../src/dtos/publicRoomDTO";
import MessageModel from "../../src/models/messageModel";
import messagesSeeder from "../../src/seeders/messagesSeeder";
import MessageDTO from "../../src/dtos/messageDTO";
import config from "../../src/config/default"

jest.setTimeout(30000);
describe('Сеятель сообщений в публичных комнатах', () => {
    let users: UserDto[];
    const countUsers = 5;

    let rooms: PublicRoomDTO[];
    const countRoomsByUser = config.userLimits.publicRoom.publicRoomCreateInDay;

    let messages: MessageDTO[];
    const countMessageByUserByRoom = 5;
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

    describe('Создание публичных комнат', () => {
        it(`Создадим ${countRoomsByUser} публичных комнат`, async () => {
            let insertedSuccess = false;
            try {
                rooms = await publicRoomSeeder.insertPublicRoomsByUserIDsWithJoin(countRoomsByUser, users.map(u=>u.id),"", false);
                insertedSuccess = true;
            }
            finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Создание сообщений', () => {
        it(`Создадим ${countMessageByUserByRoom} ообщений в каждой комнате каждого пользователя`, async () => {
            let insertedSuccess = false;
            try {
                messages = await messagesSeeder.createMessagesInPublicRoomsByUserIDs(countMessageByUserByRoom, users.map(u=>u.id.toString()))
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Валидация созданных сообщений', () => {
        let messageDocuments: any;
        it('Проверяем количество созданных документов', async () => {
            expect(messages.length).toBeGreaterThanOrEqual(countRoomsByUser*countUsers*countMessageByUserByRoom);
            messageDocuments = await MessageModel.find({});
            expect(messageDocuments.length).toEqual(messages.length);
        })

        it('Проверяем что все возвращённые id есть в документах', async () => {
            const docs_ids = messageDocuments.map((u: any) => u._id.toString())
            const seeder_ids = messages.map(u=>u.id.toString())
            expect(docs_ids.every((id: any) => seeder_ids.includes(id))).toEqual(true)
        })

        it('Проверяем что есть сообщения с одним получателем', async () => {
            const docs = messageDocuments.filter((m: any) => m.recipients.length == 1);
            expect(docs.length).not.toEqual(0)
        })

        it('Проверяем что есть сообщениям со всеми получателями', async () => {
            const docs = messageDocuments.filter((u: any) => u.recipients.length == countUsers);
            expect(docs.length).not.toEqual(0)
        })
    });
});