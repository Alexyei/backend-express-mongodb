import supertest from "supertest";
import app from "../src/App";

import {connectDB, disconnectDB} from "../src/db/connect";

export const request = supertest(app);



beforeAll(() => {
    connectDB();
});

afterAll(  () => {
    disconnectDB();
    // server.close()
});
