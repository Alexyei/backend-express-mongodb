//DTO - data transfer object
import {IMessageDocument} from "../models/messageModel";
import {IMessageDAOShort} from "../dao/messageDAO";

export interface IMessageDTO{
    message: string;
    id: string;
    author:string;
    room:string;
    recipients:string[];
    createdAt: string;

}

export interface IMessageDTOShort {
    id: string
    author: {
        login: string
    }
    message: string,
    createdAt: string
}

export default class MessageDTO implements IMessageDTO{
    message;
    id;
    author;
    recipients;
    createdAt;
    room;

    constructor(model:IMessageDocument) {
        this.message = model.message;
        this.id = model._id;
        this.author = model.author.toString();
        this.recipients = model.recipients.map(r=>r.toString())
        this.createdAt = (model as any).createdAt;
        this.room = model.room.toString()
    }
}

export class MessageDTOShort implements IMessageDTOShort {
    message;
    id;
    author;
    createdAt;

    constructor(model:IMessageDAOShort) {
        this.message = model.message;
        this.id = model._id.toString();
        this.author = model.author;
        this.createdAt = (model as any).createdAt;
    }
}