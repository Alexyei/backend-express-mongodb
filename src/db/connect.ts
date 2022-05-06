import mongoose, {ConnectOptions} from "mongoose";
import config from "../config/default";

function connectDB() {
    const dbUri = config.db.dbUri;

    return mongoose.connect(dbUri, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    } as ConnectOptions)
        .then(() => {
            console.log("Database connected");
        })
        .catch((error) => {
            console.error("db error", error);
            process.exit(1);
        });
}

export default connectDB;