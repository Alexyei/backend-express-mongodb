import userService from "../service/userService";
import faker from "@faker-js/faker";

class UserSeeder {
    async insertUsers(count: number) {
        const inserted = []
        for (let i = 0; i < count; ++i) {
            const login = faker.unique(faker.internet.userName);
            // const login = "login";
            // const password = "12345"
            const password = faker.internet.password()
            const email = faker.unique(faker.internet.email)
            // const email = "mail@mail.ru"
            const user = await userService.registration(email, login, password);
            inserted.push(user);
        }
        return inserted;
    }
}

export default new UserSeeder();