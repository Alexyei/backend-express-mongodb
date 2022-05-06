import express from "express";
import config from './config/default'
import connectDB from "./db/connect";

const PORT = config.app.port;
const HOST = config.app.host;

const app = express()

app.get('/', (req, res) => {
    res.send('Hello World!')
})

connectDB().then(() => {
        app.listen(PORT, HOST, () => {
            console.log(`Server started at ${HOST}:${PORT}`);
        })
    }
)