import mongoose, {model, Schema, Document} from "mongoose";


interface IRoomDocument extends Document{
    users: mongoose.Types.ObjectId[],
    __type: 'PrivateRoom' | 'PublicRoom' | undefined
}

const RoomSchema = new Schema({
    users: [{type: Schema.Types.ObjectId, ref: 'User',required:true}]
}, { timestamps: true, discriminatorKey: '__type', })

export interface IPublicRoomDocument extends IRoomDocument{
    password: string,
    name: string,
    owner:mongoose.Types.ObjectId,
}

const PublicRoomSchema = new Schema({
    password: {type: String},
    name: {type: String, unique: true, required: true},
    owner: {type: Schema.Types.ObjectId, ref: 'User',required:true},
}, { timestamps: true })

export interface IPrivateRoomDocument extends IRoomDocument{
    leave_users: mongoose.Types.ObjectId[],
}

const PrivateRoomSchema = new Schema({
    leave_users: [{type: Schema.Types.ObjectId, ref: 'User'}]
}, { timestamps: true })

export const RoomModel = mongoose.model<IRoomDocument>('Room', RoomSchema);
export const PublicRoomModel = RoomModel.discriminator<IPublicRoomDocument>('PublicRoom',PublicRoomSchema);
export const PrivateRoomModel = RoomModel.discriminator<IPrivateRoomDocument>('PrivateRoom',PrivateRoomSchema);
