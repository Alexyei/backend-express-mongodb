//DTO - data transfer object

import {IUserDocument} from "../models/userModel";
import mongoose from "mongoose";

export interface IUserDTO{
    email: string;
    id: string;
    login:string;
}

export default class UserDto implements IUserDTO{
    email;
    login;
    id;

    constructor(model:IUserDocument) {
        this.email = model.email;
        this.id = model._id;
        this.login = model.login;
    }
}