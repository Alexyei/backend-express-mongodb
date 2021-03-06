import publicRoomService from "../service/publicRoomService";
import faker from "@faker-js/faker";
import {shuffle} from "../utils/arrayFunctions";
import {randomInteger} from "../utils/randomFunctions";

jest.setTimeout(30000);
class publicRoomSeeder {


    async insertPublicRoomsByUserIDsWithJoin(countByUser: number, usersIDs: string[], password: string, withoutLimitsMode=true) {

        const inserted = [];

        for (let i = 0; i < usersIDs.length; ++i) {
            for (let j = 0; j < countByUser; ++j) {
                const currentUser = usersIDs[i];
                const name = faker.unique(faker.company.companyName).slice(0,32)
                const room = await publicRoomService.create(name, password, currentUser, withoutLimitsMode)


                const joinUsers = shuffle(usersIDs.filter(id => id != currentUser)).slice(0, randomInteger(0, usersIDs.length - 1))
                inserted.push({...room,users:[currentUser,...joinUsers]})
                for (const id of joinUsers) {
                    await publicRoomService.join(name, password, id, withoutLimitsMode);
                }
            }
        }
        
        return inserted;
    }

}

export default new publicRoomSeeder();