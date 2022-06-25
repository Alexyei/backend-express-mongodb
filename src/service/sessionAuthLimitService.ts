import redisClient from "../db/redis";
import config from "../config/default"
export interface SessionAuthLimitData {
    passwordAttemptLimit: number,
    blocked: null | Date
}

class SessionAuthLimitService {
    async add(userEmail: string) {


        const session_auth_key = `sess_auth:${userEmail}`

        let sessionData = await redisClient.v4.GET(session_auth_key)

        const data: SessionAuthLimitData = JSON.parse(sessionData)


        //первая сессия
        if (!sessionData) {
            sessionData = JSON.stringify({passwordAttemptLimit:config.userLimits.auth.passwordErrors-1, blocked: null})
            // await redisClient.set(session_data_key,JSON.stringify({user: userData, sessions: [session_key]}))
        } else {

            if (data.passwordAttemptLimit > 0){
                data.passwordAttemptLimit = data.passwordAttemptLimit-1
            }

            if (data.passwordAttemptLimit == 0){
                let d = new Date(); d.setMinutes(d.getMinutes() + config.userLimits.auth.blockTimeMinutes);
                data.blocked = d;
            }

            sessionData = JSON.stringify(data)

            await redisClient.v4.DEL(session_auth_key);

            // await redisClient.set(session_data_key,JSON.stringify({user: userData, sessions: [`sess:${req.sessionID}`]}))
        }

        await redisClient.v4.SET(session_auth_key, sessionData as string)

    }

    // destroy = false, когда пользователь перезаходит в другой аккаунт
    async remove(userEmail: string) {
        const session_auth_key = `sess_auth:${userEmail}`
        await redisClient.v4.DEL(session_auth_key);
    }

    async getUserData(userEmail: string) {
        const session_auth_key = `sess_auth:${userEmail}`

        let sessionData = await redisClient.v4.GET(session_auth_key)

        const data: SessionAuthLimitData = JSON.parse(sessionData)

        return data;
    }
}

export default new SessionAuthLimitService()