import UserLimitsModel, {IUserLimits, IUserLimitsDocument} from '../models/userLimitsModel'

export async function createUserLimits(userID: string) {
    return await UserLimitsModel.create({user: userID})
}

export async function getUserLimits(userID: string) {
    return UserLimitsModel.findOne({user: userID});
}

// export async function setUserLimitPublicRoomCreate(limits:IUserLimitsDocument, number: number){
//     limits.publicRoomCreateInDay = number;
//     return limits.save();
// }

export async function setUserLimits(limits:IUserLimitsDocument, newLimits:IUserLimits){
    const keys = Object.keys(newLimits) as (keyof IUserLimits)[]
    for(const limit of keys)
        (limits[limit] as number) = newLimits[limit]
    return limits.save();
}

//{"createdAt":{$gt:new Date(Date.now() - 24*60*60 * 1000)}}
// Удалять старше 24 часов
export async function delAll(){
    return UserLimitsModel.deleteMany({});
}