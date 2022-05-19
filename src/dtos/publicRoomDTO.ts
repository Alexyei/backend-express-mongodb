//DTO - data transfer object
import {IPublicRoomDocument} from "../models/roomModel";
import {IPublicRoomDAO, IPublicRoomWithMessagesDAO} from "../dao/publicRoomDAO";

export interface IPublicRoomDTO{
    name: string;
    id: string;
    owner:string;
}

export interface IPublicRoomWithLoginsDTO{
    id: string
    name: string
    password: boolean;
    owner: {
        login: string
    }
    users: {
        login: string
    }[]
}

export interface IPublicRoomWithMessagesDTO extends IPublicRoomWithLoginsDTO{
    messages: {
        author: {
            login: string
        }
        message: string,
        createdAt: string
    }[]
}
export class PublicRoomDTO implements IPublicRoomDTO{
    name;
    owner;
    id;

    constructor(model:IPublicRoomDocument) {
        this.name = model.name;
        this.id = model._id;
        this.owner = model.owner.toString();
    }
}

export class PublicRoomWithLoginsDTO implements IPublicRoomWithLoginsDTO{
    id;
    name;
    owner;
    password;
    users;

    constructor(model:IPublicRoomDAO) {
        this.name = model.name;
        this.password = model.password;
        this.owner = model.owner;
        this.users = model.users;
        this.id = model._id.toString()
    }
}

export class PublicRoomWithMessagesDTO implements IPublicRoomWithMessagesDTO{
    id;
    name;
    owner;
    password;
    users;
    messages;

    constructor(model:IPublicRoomWithMessagesDAO) {
        this.name = model.name;
        this.password = model.password;
        this.owner = model.owner;
        this.users = model.users;
        this.messages = model.messages;
        this.id = model._id.toString()
    }
}


