import {Router} from "express";
import {default as authRoutes} from "./authRoutes";
import {default as publicRoomsRoutes} from "./publicRoomsRoutes";
import {default as privateRoomsRoutes} from "./privateRoomsRoutes";
const router = Router();

function createRouter(){
    authRoutes(router);
    publicRoomsRoutes(router);
    privateRoomsRoutes(router);
}

createRouter();

export default router;