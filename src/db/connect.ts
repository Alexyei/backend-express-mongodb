import mongoose, {ConnectOptions} from "mongoose";
import config from "../config/default";
import {MongoMemoryServer} from "mongodb-memory-server";

let mongod: MongoMemoryServer | null = null;

export async function connectDB() {
    let dbUri = config.db.dbUri;

    if (process.env.NODE_ENV === 'test') {
        mongod = await MongoMemoryServer.create();
        dbUri = mongod.getUri();
    }

    return mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions)
        .then(() => {
            if (process.env.NODE_ENV !== 'test')
                console.log("Database connected");
        })
        .catch((error) => {
            console.error("db error", error);
            process.exit(1);
        });
}

export async function disconnectDB() {
    try {
        await mongoose.connection.close();
        if (mongod) {
            await mongod.stop();
        }
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}


