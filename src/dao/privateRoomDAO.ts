import {PrivateRoomModel} from "../models/roomModel";
import mongoose from "mongoose";


export interface IPrivateRoomDA0 {
    _id: mongoose.Types.ObjectId;
    users: {
        login: string
    }[]
}

export interface IPrivateRoomWithLeaveUsersDAO extends IPrivateRoomDA0{
    leave_users: {
        login: string
    }[]
}

export interface IPrivateRoomWithMessagesDAO extends IPrivateRoomDA0{
    messages: {
        _id: mongoose.Types.ObjectId;
        author: {
            login: string
        }
        message: string,
        createdAt: string
    }[]
}

export interface IPrivateRoomWithMessagesLazyDA0 extends IPrivateRoomWithMessagesDAO{
    lastMessage: Date;
}


export async function createPrivateRoom(users: string[], leave_users: string[]){
    return await PrivateRoomModel.create({users: users, leave_users: leave_users});
}
export async function getUserPrivateRoomByID(roomID:string, userID:string){
    return PrivateRoomModel.findOne({"_id":new mongoose.Types.ObjectId(roomID), "users": new mongoose.Types.ObjectId(userID) })
}

export async function getUserPrivateRoomWithLeaveUsers(anotherUserID:string, userID:string):Promise<IPrivateRoomWithLeaveUsersDAO[]>{
    const match = anotherUserID!==userID?{$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}: {"users": [new mongoose.Types.ObjectId(userID)] }
    // const match = {$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}
    return PrivateRoomModel.aggregate().match(match)
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .lookup({ from: 'users', localField: 'leave_users', foreignField: '_id', as: 'leave_users' })
        .project({ _id:1,"users.login":1, "leave_users.login":1});
}

export async function getUserPrivateRoomsWithLeaveUsers(userID:string):Promise<IPrivateRoomWithLeaveUsersDAO[]>{
    return PrivateRoomModel.aggregate().match({  "users": new mongoose.Types.ObjectId(userID)})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .lookup({ from: 'users', localField: 'leave_users', foreignField: '_id', as: 'leave_users' })
        .project({ _id:1,"users.login":1, "leave_users.login":1});
}

export async function getUserPrivateRoomWithMessages(anotherUserID:string, userID:string):Promise<IPrivateRoomWithMessagesDAO[]>{
     const match = anotherUserID!==userID?{$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}: {"users": [new mongoose.Types.ObjectId(userID)] }
    // Условие ниже не подходит в случае чата для самого себя
    // const match = {$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}
    return PrivateRoomModel.aggregate().match(match)
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
        .project({ _id:1, "users.login":1, "messages._id":1,
            "messages.message":1, "messages.author.login": 1, "messages.createdAt": 1
        });
}

export async function getUserPrivateRoomWithLastMessages(anotherUserID:string, userID:string,messagesLimit:number):Promise<IPrivateRoomWithMessagesLazyDA0[]>{
    const match = anotherUserID!==userID?{$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}: {"users": [new mongoose.Types.ObjectId(userID)] }

    return PrivateRoomModel.aggregate().match(match)
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .lookup({from: 'messages', localField: '_id',foreignField: 'room', as: 'messages',
            pipeline: [
                {$match: {recipients: new mongoose.Types.ObjectId(userID)}},
                {$sort: {createdAt: -1}},
                {$limit: messagesLimit},
                {$sort: {createdAt: 1}},
                { $lookup: {
                        from: 'users',
                        localField: 'author',foreignField: '_id', as: 'author'
                    }},
                { $unwind: "$author" },

            ],

        })
        // .addFields({messages: {$filter: {input: '$messages', as: 'item', cond: {$in: [new mongoose.Types.ObjectId(userID), '$$item.recipients' ]}}}})
        .project({ _id:1,  "users.login":1, "messages._id":1,
            "messages.message":1, "messages.author.login": 1, "messages.createdAt": 1, "lastMessage": { $max: "$messages.createdAt" },
        })
        .sort({lastMessage:-1})
}


export async function getUserPrivateRoomsWithMessages(userID:string):Promise<IPrivateRoomWithMessagesDAO[]>{
    return PrivateRoomModel.aggregate().match({ "users": new mongoose.Types.ObjectId(userID), "leave_users": {$ne: new mongoose.Types.ObjectId(userID)}})
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
        .project({ _id:1, "users.login":1,"messages._id":1,
            "messages.message":1, "messages.author.login": 1, "messages.createdAt": 1
        });
}

export async function getUserPrivateRoomsWithLastMessagesLazy(userID:string,roomsLimit:number,messagesLimit:number, timestamp: Date, nin: string[]):Promise<IPrivateRoomWithMessagesLazyDA0[]>{
    const ids = nin.map(id => new mongoose.Types.ObjectId(id));
    return PrivateRoomModel.aggregate().match({ "users": new mongoose.Types.ObjectId(userID), "leave_users": {$ne: new mongoose.Types.ObjectId(userID)}})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .lookup({from: 'messages', localField: '_id',foreignField: 'room', as: 'messages',
            pipeline: [
                {$match: {recipients: new mongoose.Types.ObjectId(userID)}},
                {$sort: {createdAt: -1}},
                {$limit: messagesLimit},
                {$sort: {createdAt: 1}},
                { $lookup: {
                        from: 'users',
                        localField: 'author',foreignField: '_id', as: 'author'
                    }},
                { $unwind: "$author" },

            ],

        })
        // .addFields({messages: {$filter: {input: '$messages', as: 'item', cond: {$in: [new mongoose.Types.ObjectId(userID), '$$item.recipients' ]}}}})
        .project({ _id:1, "users.login":1, "messages._id":1,
            "messages.message":1, "messages.author.login": 1, "messages.createdAt": 1, "lastMessage": { $max: "$messages.createdAt" },
        })
        .sort({lastMessage:-1})
        .match({$and: [{lastMessage: {$lte: timestamp}}, {_id: {$nin: ids}}]})
        .limit(roomsLimit)
    // .sort({lastMessage:1})
}



export async function getOpenedPrivateRoomByID(roomID:string, userID:string){
    return PrivateRoomModel.findOne({"_id":new mongoose.Types.ObjectId(roomID), "leave_users": {$ne: new mongoose.Types.ObjectId(userID)} })
}

export async function getPrivateRoomByUsers(anotherUserID:string, userID:string){
    const match = anotherUserID!==userID?{$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}: {"users": [new mongoose.Types.ObjectId(userID)] }
    // const match = {$and: [ {"users": new mongoose.Types.ObjectId(anotherUserID)},  {"users": new mongoose.Types.ObjectId(userID)}]}
    return PrivateRoomModel.findOne(match);
}

export async function getPrivateRoomByID(roomID:string){
    return PrivateRoomModel.findOne({_id:new mongoose.Types.ObjectId(roomID)});
}
