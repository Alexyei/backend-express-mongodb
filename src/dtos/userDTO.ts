//DTO - data transfer object

import {UserDocument} from "../models/userModel";

export interface UserDtoInterface{
    email: string;
    id: any;
    login:string;
}

export default class UserDto implements UserDtoInterface{
    email;
    login;
    id;

    constructor(model:UserDocument) {
        this.email = model.email;
        this.id = model._id;
        this.login = model.login;
    }
}