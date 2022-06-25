import {createUserLimits, getUserLimits, setUserLimits} from "../dao/userLimitsDAO";
import {IUserLimits} from "../models/userLimitsModel";
class UserLimitsService{
    // async checkCanCreatePublicRoom(userID:string){
    //     const limits = await getUserLimits(userID)
    //     return limits == null || limits.publicRoomCreateInDay > 0
    // }

    // async reducePublicRoomCreateLimit(userID:string){
    //     let limits = await getUserLimits(userID)
    //     if (limits == null)
    //         limits = await createUserLimits(userID)
    //
    //     return await setUserLimitPublicRoomCreate(limits,limits.publicRoomCreateInDay - 1)
    // }

    // async checkCanJoinPublicRoom(userID:string){
    //     const limits = await getUserLimits(userID)
    //     return limits == null || limits.publicRoomJoinInDay > 0
    // }

    async checkUserLimit(userID:string, limitName: keyof IUserLimits){
        const limits = await getUserLimits(userID)
        return limits == null || limits[limitName] > 0
    }

    async reduceUserLimit(userID:string, reduceValueLimits: IUserLimits){
        let limits = await getUserLimits(userID)
        if (limits == null)
            limits = await createUserLimits(userID)

        const keys = Object.keys(reduceValueLimits) as (keyof typeof reduceValueLimits)[]
        for(const key of keys){
            reduceValueLimits[key] = limits[key] - reduceValueLimits[key]
        }
        return await setUserLimits(limits,reduceValueLimits)
    }
}

export default new UserLimitsService()