import messageService from "../service/messageService";
import publicRoomService from "../service/publicRoomService";
import faker from "@faker-js/faker";
import {randomInteger} from "../utils/randomFunctions";
import privateRoomService from "../service/privateRoomService";

class messagesSeeder {
    async createMessagesInPublicRoomsByUserIDs(count: number, usersIDs: string[]) {
        const inserted = [];
        for (const userID of usersIDs) {
            const userRooms = await publicRoomService.getUserRoomsWithLogins(userID)
            for (const room of userRooms) {
                for (let i = 0; i < count; ++i) {
                    const message = await messageService.create(room.id, userID, faker.lorem.words(randomInteger(1, 30)))
                    inserted.push(message)
                }
            }
        }

        return inserted;
    }

    async createMessagesInPrivateRoomsByUserIDs(count: number, usersIDs: string[]) {
        const inserted = [];
        for (const userID of usersIDs) {
            const userRooms = await privateRoomService.getUserPrivateRoomsWithLeaveUsers(userID)
            for (const room of userRooms) {
                for (let i = 0; i < count; ++i) {
                    const message = await messageService.create(room.id, userID, faker.lorem.words(randomInteger(1, 30)))
                    inserted.push(message)
                }
            }
        }

        return inserted;
    }
}

export default new messagesSeeder();