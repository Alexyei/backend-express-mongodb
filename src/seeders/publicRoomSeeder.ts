import publicRoomService from "../service/publicRoomService";
import faker from "@faker-js/faker";
import {shuffle} from "../utils/arrayFunctions";
import {randomInteger} from "../utils/randomFunctions";

class publicRoomSeeder {


    async insertPublicRoomsByUserIDsWithJoin(countByUser: number, usersIDs: string[], password: string) {
        const inserted = [];
        for (let i = 0; i < usersIDs.length; ++i) {
            for (let j = 0; j < countByUser; ++j) {
                const currentUser = usersIDs[i];
                const name = faker.unique(faker.company.companyName)
                const room = await publicRoomService.create(name, password, currentUser)
                inserted.push(room)

                const joinUsers = shuffle(usersIDs.filter(id => id != currentUser)).slice(0, randomInteger(0, usersIDs.length - 1))
                for (const id of joinUsers) {
                    await publicRoomService.join(name, password, id);
                }
            }
        }
        return inserted;
    }

}

export default new publicRoomSeeder();