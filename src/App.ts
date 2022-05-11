import express from "express";
import config from './config/default'
import connectDB from "./db/connect";
import errorMiddleware from "./middlewares/errorMiddleware";
import cors from 'cors'
import router from "./router/routes";

const PORT = config.app.port;
const HOST = config.app.host;


const app = express()
app.use(express.json())

app.use(cors({
    // credentials: true,
    origin: config.app.client_url
}));
app.use('/api', router);
app.use(errorMiddleware);

connectDB().then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`Server started at ${HOST}:${PORT}`);
        })
    }
)