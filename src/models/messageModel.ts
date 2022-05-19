import mongoose, {model, Schema, Document} from "mongoose";


export interface IMessageDocument extends Document{
    message: string,
    room:mongoose.Types.ObjectId,
    author:mongoose.Types.ObjectId,
    recipients: mongoose.Types.ObjectId[],
}

const MessageSchema = new Schema({
    room: {type: Schema.Types.ObjectId, ref: 'Room',required:true},
    message: {type: String, required: true},
    author: {type: Schema.Types.ObjectId, ref: 'User',required:true},
    recipients: [{type: Schema.Types.ObjectId, ref: 'User',required:true}]
}, { timestamps: true })

export default model<IMessageDocument>('Message', MessageSchema);