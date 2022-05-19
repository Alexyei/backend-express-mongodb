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
import MessageModel from "../models/messageModel";

export async function createMessage(roomID: string, authorID: string, message:string, recipientsIDs:string[]){
    return await MessageModel.create({room: roomID, author: authorID, message, recipients: recipientsIDs})
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

