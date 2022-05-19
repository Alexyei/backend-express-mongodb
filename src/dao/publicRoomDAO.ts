import {PublicRoomModel} from "../models/roomModel";
import mongoose from "mongoose";

interface IPublicRoomCreateProps{
    name: string,
    hashPassword: string | null,
    userID:string
}

export interface IPublicRoomDAO {
    _id: mongoose.Types.ObjectId;
    name: string
    password: boolean;
    owner: {
        login: string
    }
    users: {
        login: string
    }[]
}

export interface IPublicRoomWithMessagesDAO extends IPublicRoomDAO{
    messages: {
        author: {
            login: string
        }
        message: string,
        createdAt: string
    }[]
}

export async function createPublicRoom({name, hashPassword,  userID}:IPublicRoomCreateProps){
    return await PublicRoomModel.create({name, owner:userID, password: hashPassword});
}

export async function getPublicRoomByName(name:string){
    return PublicRoomModel.findOne({name});
}


export async function getUserPublicRoom(name:string, userID:string){
    return PublicRoomModel.findOne({name:name, "users": new mongoose.Types.ObjectId(userID) })
}

export async function getUserPublicRoomByID(roomID:string, userID:string){
    return PublicRoomModel.findOne({"_id":new mongoose.Types.ObjectId(roomID), "users": new mongoose.Types.ObjectId(userID) })
}

export async function getPublicRoomByNameWithUsersLogins(name:String):Promise<IPublicRoomDAO[]>{
    return PublicRoomModel.aggregate().match({ name})
        .lookup({ from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' }).unwind({path:"$owner"})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .project({ _id:1,name:1,"password": {$ne:["$password",null]}, "owner.login":1, "users.login":1});
}

export async function getUserPublicRoomsWithUsersLogins(userID:string):Promise<IPublicRoomDAO[]>{
    return PublicRoomModel.aggregate().match({ "users": new mongoose.Types.ObjectId(userID)})
        .lookup({ from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' }).unwind({path:"$owner"})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .project({ _id:1,name:1,"password": {$ne:["$password",null]}, "owner.login":1, "users.login":1});
}


export async function getUserPublicRoomWithMessages(roomID:string, userID:string):Promise<IPublicRoomWithMessagesDAO[]>{
    return PublicRoomModel.aggregate().match({ "_id":new mongoose.Types.ObjectId(roomID), "users": new mongoose.Types.ObjectId(userID)})
        .lookup({ from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' }).unwind({path:"$owner"})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .lookup({from: 'messages', localField: '_id',foreignField: 'room', as: 'messages',
            pipeline: [
                { $lookup: {
                        from: 'users',
                        localField: 'author',foreignField: '_id', as: 'author'
                    }},
                { $unwind: "$author" },
            ],
        })
        .addFields({messages: {$filter: {input: '$messages', as: 'item', cond: {$in: [new mongoose.Types.ObjectId(userID), '$$item.recipients' ]}}}})
        .project({ _id:1,name:1,"password": { $ne: [ "$password", null ] }, "owner.login":1, "users.login":1,
            "messages.message":1, "messages.author.login": 1, "messages.createdAt": 1
        });
}


export async function getUserPublicRoomsWithMessages(userID:string):Promise<IPublicRoomWithMessagesDAO[]>{
    return PublicRoomModel.aggregate().match({ "users": new mongoose.Types.ObjectId(userID)})
        .lookup({ from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' }).unwind({path:"$owner"})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .lookup({from: 'messages', localField: '_id',foreignField: 'room', as: 'messages',
            pipeline: [
                { $lookup: {
                        from: 'users',
                        localField: 'author',foreignField: '_id', as: 'author'
                    }},
                { $unwind: "$author" },
            ],

        })
        .addFields({messages: {$filter: {input: '$messages', as: 'item', cond: {$in: [new mongoose.Types.ObjectId(userID), '$$item.recipients' ]}}}})
        .project({ _id:1,name:1,"password": { $ne: [ "$password", null ] }, "owner.login":1, "users.login":1,
            "messages.message":1, "messages.author.login": 1, "messages.createdAt": 1
        });
}

