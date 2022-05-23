import privateRoomService from "../service/privateRoomService";

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
}

export default new privateRoomSeeder();