import {
    createPublicRoom,
    getPublicRoomByName,
    getUserPublicRoomsWithUsersLogins,
    checkUserInPublicRoom, getPublicRoomByNameWithUsersLogins
} from "../dao/publicRoomDAO";
import {IPublicRoomDocument} from "../models/roomModel";
import PublicRoomDto from "../dtos/publicRoomDTO";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError";

class PublicRoomService{
    async create(name:string, password:string, userID:string) {
        const hashPassword = password ? await bcrypt.hash(password, 3) : null;

        const room:IPublicRoomDocument = await createPublicRoom({name, hashPassword, userID})

        await this.joinUserToRoom(name,userID)

        const roomDto = new PublicRoomDto(room);

        return roomDto;
    }

    async join(name:string, password:string, userID:string) {
        const room = await getPublicRoomByName(name)
        if (room === null) {
            throw ApiError.BadRequest('Комната с таким названием не найдена')
        }
        const isPassEquals = room.password != null ? password && await bcrypt.compare(password, room.password) : true;
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверное название комнаты или пароль');
        }
        if (null !== await checkUserInPublicRoom(name, userID)){
            throw ApiError.BadRequest('Вы уже вступили в эту комнату');
        }
        await this.joinUserToRoom(name,userID)

        return (await getPublicRoomByNameWithUsersLogins(room.name))[0];
    }


    private async joinUserToRoom(name:string, userID:string){
        const result = await getPublicRoomByName(name)
        if (!result)
            throw ApiError.BadRequest(`Комната с именем ${name} не найдена`);
        result.users.push(new mongoose.Types.ObjectId(userID))
        return result.save();
    }

    async getUserRooms(userID: string) {
        return await getUserPublicRoomsWithUsersLogins(userID);
    }
}

export default new PublicRoomService()