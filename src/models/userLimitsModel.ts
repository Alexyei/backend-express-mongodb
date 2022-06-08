import mongoose, {model, Schema, Document} from "mongoose";
import config from '../config/default'

export interface IUserLimitsDocument extends Document{
    user:mongoose.Types.ObjectId,
    publicRoomCreateInDay: number,
    publicRoomJoinInDay: number,
    privateRoomCreateInDay: number,
    publicMessageInDay: number,
    privateMessageInDay:number
}

// export type IUserLimits = {
//     // publicRoomCreateInDay?: number,
//     // publicRoomJoinInDay?: number,
//     // privateRoomCreateInDay?: number,
//     // publicMessageInDay?: number,
//     // privateMessageInDay?:number
//     [Property in keyof IUserLimitsDocument as Exclude<Property, "user">]?:number
// }

export type IUserLimits = Partial<Omit<IUserLimitsDocument, "user">>

const UserLimitsSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User',required:true},
    publicRoomCreateInDay: {type: Number, required: true, default:config.userLimits.publicRoom.publicRoomCreateInDay},
    publicRoomJoinInDay: {type: Number, required: true, default:config.userLimits.publicRoom.publicRoomJoinInDay},
    privateRoomCreateInDay: {type: Number, required: true, default:config.userLimits.privateRoom.privateRoomCreateInDay},
    publicMessageInDay: {type: Number, required: true, default:config.userLimits.messages.publicMessagesInDay},
    privateMessageInDay: {type: Number, required: true, default:config.userLimits.messages.privateMessagesInDay},
}, { timestamps: true })

export default model<IUserLimitsDocument>('UserLimits', UserLimitsSchema);