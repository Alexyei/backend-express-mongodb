import session from "express-session";
import connectRedis from "connect-redis";
import redisClient from "../db/redis";

const RedisStore = connectRedis(session)
const store = new RedisStore({client: redisClient})

export default session({
    store: store,
    secret: 'session-secret-word',
    //не перезаписывать сессию, ждать пока пройдёт срок годности, потом заново логиниться
    resave: false,
    //не записывать пустую сессию в БД
    saveUninitialized: false,
    //название печенья
    name: 'sessionId',
    cookie: {
        secure: false, // if true: only transmit cookie over https //set true in production when get ssl
        httpOnly: true, // if true: prevent client side read cookie from JS
        maxAge: 30 * 24 * 60 * 60 * 1000 // session max age in milliseconds (30 days)
    }
})



