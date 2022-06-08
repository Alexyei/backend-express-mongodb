import express, {Express} from "express";
import config from './config/default'
import {connectDB} from "./db/connect";
import errorMiddleware from "./middlewares/errorMiddleware";
import cors from 'cors'
import router from "./router/routes";
import UserDto from "./dtos/userDTO";
import sessionMiddleware from "./middlewares/sessionMiddleware";
import cronStart from "./cron/cronStart";


const PORT = config.app.port;
const HOST = config.app.host;

declare module 'express-session' {
    interface SessionData {
        userID: string;
    }
}

const app = express()
app.use(express.json())
app.use(sessionMiddleware)
app.use(cors({
    credentials: true,
    origin: config.app.api_url
    // origin: 'https://learn.javascript.ru'
}));
app.use('/api', router);
app.use(errorMiddleware);


function startListening(app: Express){
    return app.listen(PORT, HOST, () => {
        console.log(`Server started at ${HOST}:${PORT}`);
    })
}

if (process.env.NODE_ENV !== 'test')
    connectDB().then(() => {
        cronStart();
            startListening(app)
        }
    )
export default app;