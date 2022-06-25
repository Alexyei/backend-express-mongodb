// interface createRoomMessagePropsInterface{
//     message: string,
//     room: RoomDocument,
//     user:UserDtoInterface
// }
//
// interface createPrivateRoomMessagePropsInterface{
//     message: string,
//     room: PrivateRoomDocument,
//     user:UserDtoInterface
// }


export interface IMessageDAOShort {
    _id: mongoose.Types.ObjectId
    author: {
        login: string
    }
    message: string,
    createdAt: string
}

import MessageModel from "../models/messageModel";
import messageModel from "../models/messageModel";
import mongoose from "mongoose";
import { DocumentDefinition, FilterQuery } from "mongoose";
export async function createMessage(roomID: string, authorID: string, message: string, recipientsIDs: string[]) {
    return await MessageModel.create({room: roomID, author: authorID, message, recipients: recipientsIDs})
}

export async function getUserMessagesByRoomIDLazy(roomID: string, userID: string, limit: number, timestamp: Date, nin: string[]):Promise<IMessageDAOShort[]> {
    const ids = nin.map(id => new mongoose.Types.ObjectId(id));
    return messageModel.aggregate()
        .match({room: new mongoose.Types.ObjectId(roomID), recipients: new mongoose.Types.ObjectId(userID)})
        // .match({room: new mongoose.Types.ObjectId(roomID)})
        .sort({createdAt: -1})
        // .match({$and: [{createdAt: {$lte: timestamp}}, {_id: {$nin: ids}}]})
        .match({$and: [{createdAt: {$lte: timestamp}}, {_id: {$nin: ids}}]})
        .limit(limit)
        .sort({createdAt: 1})
        .lookup({from: 'users', localField: 'author', foreignField: '_id', as: 'author'})
        .unwind('author')
        .project({_id: 1, "author.login": 1, message: 1, createdAt: 1})
}

export async function getMessageByID(ID:string){
    return messageModel.findById(new mongoose.Types.ObjectId(ID))
}

//
// export async function createRoomMessage({room, message,  user}:createRoomMessagePropsInterface){
//     // console.log(room.users.map((user:any)=>user._id))
//    return await RoomMessageModel.create({room: room.id, author:user.id, message, recipients: room.users.map((user:any)=>user._id)} as RoomMessageDocument);
// }
//
// export async function createPrivateRoomMessage({room, message,  user}:createPrivateRoomMessagePropsInterface){
//     // console.log(room.users.map((user:any)=>user._id))
//     return await RoomMessageModel.create({room: room.id, author:user.id, message, recipients: room.users.filter((user:any)=>
//         room.leave_users.filter((lu:any)=>lu._id === user._id).length === 0
//         ).map((user:any)=>user._id)});
// }

// export async function getMyMessage({room, message,  user}:createRoomMessagePropsInterface){
//     return await RoomMessageModel.create({room: room.id, author:user.id, message, recipients: room.users.map((user:any)=>user.id)} as RoomMessageDocument);
// }

