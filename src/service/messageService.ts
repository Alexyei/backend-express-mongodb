import {getRoomByID} from "../dao/roomDAO";
import ApiError from "../exceptions/ApiError";
import {createMessage} from "../dao/messageDAO";
import MessageDTO from "../dtos/messageDTO";

class MessageService{
    async create(roomID:string, userID:string, message:string) {

        const room = await getRoomByID(roomID);
        if (room === null)
            throw ApiError.BadRequest(`Комнаты с id ${roomID} не существует!`)

        if (!room.users.map(u=>u.toString()).includes(userID))
            throw ApiError.BadRequest(`Вы не являетесь участником комнаты!`)

        let recipients = room.users.map(u => u.toString());

        const messageData = await createMessage(roomID,userID,message,recipients)

        return new MessageDTO(messageData);
    }
    //
    // async createPrivate(message:string, roomId:string, user:UserDto) {
    //
    //     const room = await privateRoomService.getPrivateRoomDocument(roomId) as PrivateRoomDocument | null;
    //     if (room === null)
    //         throw ApiError.BadRequest(`Комнаты ${roomId} не существует!`)
    //     //
    //
    //     const roomMessage:RoomMessageDocument = await createPrivateRoomMessage({room, message, user})
    //
    //
    //
    //
    //     const roomMessageDto = new RoomMessageDto(roomMessage);
    //
    //     return roomMessageDto;
    // }
}

export default new MessageService();