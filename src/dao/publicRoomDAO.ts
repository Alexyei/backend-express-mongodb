import {PublicRoomModel} from "../models/roomModel";
import {IUserDTO} from "../dtos/userDTO";
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import {IPrivateRoomDA0} from "./privateRoomDAO";

interface IPublicRoomCreateProps{
    name: string,
    hashPassword: string | null,
    userID:string
}

export interface IPublicRoomDAO {
    name: string
    password: boolean;
    owner: {
        login: string
    }
    users: {
        login: string
    }[]
}

export async function createPublicRoom({name, hashPassword,  userID}:IPublicRoomCreateProps){
    return await PublicRoomModel.create({name, owner:userID, password: hashPassword});
}

export async function getPublicRoomByName(name:string){
    return PublicRoomModel.findOne({name});
}

export async function checkUserInPublicRoom(name:string, userID:string){
    return PublicRoomModel.findOne({name:name, "users": new mongoose.Types.ObjectId(userID) })
}

export async function getUserPublicRoomsWithUsersLogins(userID:string):Promise<IPublicRoomDAO[]>{
    return PublicRoomModel.aggregate().match({ "users": new mongoose.Types.ObjectId(userID)})
        .lookup({ from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' }).unwind({path:"$owner"})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .project({ _id:0,name:1,"password": {$ne:["$password",null]}, "owner.login":1, "users.login":1});
}

export async function getPublicRoomByNameWithUsersLogins(name:String):Promise<IPublicRoomDAO[]>{
    return PublicRoomModel.aggregate().match({ name})
        .lookup({ from: 'users', localField: 'owner', foreignField: '_id', as: 'owner' }).unwind({path:"$owner"})
        .lookup({ from: 'users', localField: 'users', foreignField: '_id', as: 'users' })
        .project({ _id:0,name:1,"password": {$ne:["$password",null]}, "owner.login":1, "users.login":1});
}