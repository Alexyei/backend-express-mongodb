import UserModel from "../models/userModel";
import mongoose from "mongoose";

interface createUserPropsInterface{
    email: string,
    login:string,
    hashPassword: string,
}

export async function createUser({email, login,  hashPassword}:createUserPropsInterface){
   return await UserModel.create({email, login, password: hashPassword});
}

export async function findUserByEmail(email:string){
   return UserModel.findOne({email});
}

export async function findUserByLogin(login:string){
   return UserModel.findOne({login});
}

export async function findUserByID(userID:string){
    return UserModel.findOne({_id:new mongoose.Types.ObjectId(userID)});
}

