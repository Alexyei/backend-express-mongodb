//DTO - data transfer object

import {IMessageDocument} from "../models/messageModel";

export interface IMessageDTO{
    message: string;
    id: string;
    author:string;
    room:string;
    recipients:string[];
    createdAt: string;

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