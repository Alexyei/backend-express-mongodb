import userSeeder from "../../src/seeders/userSeeder";
import UserDto from "../../src/dtos/userDTO";
import publicRoomSeeder from "../../src/seeders/publicRoomSeeder";
import {PublicRoomDTO} from "../../src/dtos/publicRoomDTO";
import MessageModel from "../../src/models/messageModel";
import messagesSeeder from "../../src/seeders/messagesSeeder";
import MessageDTO from "../../src/dtos/messageDTO";
import {IPrivateRoomDocument} from "../../src/models/roomModel";
import privateRoomSeeder from "../../src/seeders/privateRoomSeeder";


// jest.setTimeout(30000);
describe('Сеятель сообщений в приватных комнатах', () => {
    let users: UserDto[];
    const countUsers = 10;

    let rooms: (IPrivateRoomDocument & {_id: any})[];
    const countRooms = ((countUsers-1)+1) * (1 + countUsers) / 2

    let messages: MessageDTO[];
    const countMessageByUserByRoom = 10;
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
                rooms = await privateRoomSeeder.insertPrivateRoomsByUserIDs(users.map(u=>u.id))
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Создание сообщений', () => {
        it(`Создадим ${countMessageByUserByRoom} ообщений в каждой комнате каждого пользователя`, async () => {
            let insertedSuccess = false;
            try {
                messages = await messagesSeeder.createMessagesInPrivateRoomsByUserIDs(countMessageByUserByRoom, users.map(u=>u.id.toString()))
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });

    describe('Валидация созданных сообщений', () => {
        let messageDocuments: any;
        it('Проверяем количество созданных документов', async () => {
            //У каждого пользователь один чат на одного и 9 на двоих (итого 55)
            //55-10 количество чатов на двоих в них пишет собеседник
            //55 количество комнат в которые пишет хозяин чата
            const count = (countRooms+countRooms-countUsers)*countMessageByUserByRoom
            expect(messages.length).toEqual(count);
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

        it('Проверяем что есть сообщения с двумя получателями', async () => {
            const docs = messageDocuments.filter((u: any) => u.recipients.length == 2);
            expect(docs.length).not.toEqual(0)
        })

        it('Проверяем что нет сообщения с тремя и более получателями', async () => {
            const docs = messageDocuments.filter((u: any) => u.recipients.length > 2);
            expect(docs.length).toEqual(0)
        })
    });
});