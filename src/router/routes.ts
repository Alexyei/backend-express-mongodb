import {Router} from "express";
import {default as authRoutes} from "./authRoutes";
import {default as publicRoomsRoutes} from "./publicRoomsRoutes";
import {default as privateRoomsRoutes} from "./privateRoomsRoutes";
import {default as messagesRoutes} from "./messageRoutes";

const router = Router();

function createRouter() {
    authRoutes(router);
    publicRoomsRoutes(router);
    privateRoomsRoutes(router);
    if (process.env.NODE_ENV === 'test') {
        messagesRoutes(router)
    }
}

createRouter();

export default router;