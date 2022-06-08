import privateRoomService from "../service/privateRoomService";
import userSeeder from "./userSeeder";

class privateRoomSeeder {
    async insertPrivateRoomsByUserIDs(usersIDs: string[]) {
        const inserted = [];
        for (let i = 0; i < usersIDs.length; ++i) {
            const currentUser = usersIDs[i];
            for (let j = i; j < usersIDs.length; ++j) {
                const anotherUser = usersIDs[j];
                const room = await privateRoomService.createRoom(anotherUser, currentUser)
                inserted.push(room)
            }
        }
        return inserted;
    }

    async insertPrivateRoomsByUserID(userID: string,roomsCount: number) {
        const inserted = [];
        const users = await userSeeder.insertUsers(roomsCount);
        for (let i = 0; i < users.length; ++i) {
            const currentUser = users[i];
            const room = await privateRoomService.createOrOpen(currentUser.login, userID)
            inserted.push(room)
        }
        return inserted;
    }
}

export default new privateRoomSeeder();