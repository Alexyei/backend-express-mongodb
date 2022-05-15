import UserDto from "../dtos/userDTO";
import redisClient from "../db/redis";
import config from '../config/default'
import {Request} from "express";

export interface SessionData {
    sessions: string[]
    user: UserDto
}

class SessionService {
    async add(req: Request, userData: UserDto) {

        // пользователь перезаходит в другой аккаунт
        if (req.session.userID && req.session.userID !== userData.id){
            await this.remove(req, false)
        }


        req.session.userID = userData.id

        const session_key = `sess:${req.sessionID}`
        const session_data_key = `sess_data:${userData.id}`

        let sessionData = await redisClient.v4.GET(session_data_key)

        const data: SessionData = JSON.parse(sessionData)

        // Если текущая сессия действительна, не нужно добавлять новую
        if (data && data.sessions.includes(session_key))
            return;

        //первая сессия
        if (!sessionData) {
            sessionData = JSON.stringify({user: userData, sessions: [session_key]})
            // await redisClient.set(session_data_key,JSON.stringify({user: userData, sessions: [session_key]}))
        } else {


            const sessionCount = data.sessions.length;
            const sessionLimit = config.session.limitPerUser;

            if (sessionCount >= sessionLimit) {
                const deleted = data.sessions.splice(0, sessionCount - sessionLimit + 1);
                await redisClient.v4.DEL(deleted);
            }

            data.sessions.push(session_key)

            sessionData = JSON.stringify(data)

            // await redisClient.set(session_data_key,JSON.stringify({user: userData, sessions: [`sess:${req.sessionID}`]}))
        }

        await redisClient.v4.SET(session_data_key, sessionData as string)

    }

    // destroy = false, когда пользователь перезаходит в другой аккаунт
    async remove(req: Request, destroy= true, callback: (err: any) => void = ()=>{}) {
        const session_data_key = `sess_data:${req.session.userID}`;
        const session_key = `sess:${req.sessionID}`

        let sessionData = await redisClient.v4.GET(session_data_key) as string;
        const data: SessionData = JSON.parse(sessionData)
        data.sessions = data.sessions.filter(sess => sess != session_key)

        if (data.sessions.length !== 0)
            await redisClient.v4.SET(session_data_key, JSON.stringify(data))
        else
            await redisClient.v4.DEL(session_data_key);

        if (destroy)
        return req.session.destroy(callback)
    }

    // удаляет все сессии пользователя (выйти со всех устройств)
    async clear(id: any) {
        const session_data_key = `sess_data:${id}`;
        let sessionData = await redisClient.v4.GET(session_data_key);
        if (!sessionData)
            return;
        const data: SessionData = JSON.parse(sessionData)
        await redisClient.v4.DEL([...data.sessions, session_data_key]);
        // await redisClient.v4.DEL(session_data_key);
    }

    async getUserData(req: Request) {
        const session_data_key = `sess_data:${req.session.userID}`;
        const session_key = `sess:${req.sessionID}`


        // let keys = await redisClient.v4.KEYS('*')
        const sessionData = await redisClient.v4.GET(session_data_key);

        const data: SessionData = JSON.parse(sessionData as string)

        return data.user;
    }
}

export default new SessionService()