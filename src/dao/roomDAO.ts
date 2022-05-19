import {RoomModel} from "../models/roomModel";
import mongoose from "mongoose";

export async function getRoomByID(roomID:string){
    return RoomModel.findOne({_id:new mongoose.Types.ObjectId(roomID)});
}