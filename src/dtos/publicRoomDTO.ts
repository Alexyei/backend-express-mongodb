//DTO - data transfer object
import {IPublicRoomDocument} from "../models/roomModel";

export interface IPublicRoomDTO{
    name: string;
    id: string;
    owner:string;
}

export default class PublicRoomDTO implements IPublicRoomDTO{
    name;
    owner;
    id;

    constructor(model:IPublicRoomDocument) {
        this.name = model.name;
        this.id = model._id;
        this.owner = model.owner.toString();
    }
}