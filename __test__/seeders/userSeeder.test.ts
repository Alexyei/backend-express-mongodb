import userSeeder from "../../src/seeders/userSeeder";
import userModel from "../../src/models/userModel";
import UserDto from "../../src/dtos/userDTO";

// jest.useFakeTimers()

describe('Сеятель пользователей', () => {
    let users: UserDto[];
    const count = 100;
    describe('Создание пользователей', () => {
        it(`Создадим ${count} пользователей`, async () => {
            let insertedSuccess = false;
            try {
                users = await userSeeder.insertUsers(count);
                insertedSuccess = true;
            } finally {
                expect(insertedSuccess).toEqual(true)
            }
        });
    });
    describe('Валидация созданных пользователей', () => {
        let userDocuments: any;
        it('Проверяем количество созданных документов', async () => {
            expect(users.length).toEqual(count);
            userDocuments = await userModel.find({});
            expect(userDocuments.length).toEqual(count);
        })

        it('Проверяем уникальность логинов и email', async () => {
            const set =  new Set(userDocuments.map((u: any) => u.login))
            expect(set.size).toEqual(count)
            expect(new Set(userDocuments.map((u: any) => u.email)).size).toEqual(count)

        })

        it('Проверяем что все возвращённые id есть в документах', async () => {
            const docs_ids = userDocuments.map((u: any) => u._id.toString())
            const seeder_ids = users.map(u=>u.id.toString())
            expect(docs_ids.every((id: any) => seeder_ids.includes(id))).toEqual(true)
        })
    });
});