import {
    createPublicRoom,
    getPublicRoomByName,
    getUserPublicRoomsWithUsersLogins,
    getUserPublicRoom, getPublicRoomByNameWithUsersLogins,
    getUserPublicRoomWithMessages, getUserPublicRoomsWithMessages, getUserPublicRoomByID
} from "../dao/publicRoomDAO";
import {IPublicRoomDocument} from "../models/roomModel";
import {PublicRoomDTO, PublicRoomWithLoginsDTO, PublicRoomWithMessagesDTO} from "../dtos/publicRoomDTO";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError";

class PublicRoomService{
    async create(name:string, password:string, userID:string) {
        const hashPassword = password ? await bcrypt.hash(password, 3) : null;

        const room:IPublicRoomDocument = await createPublicRoom({name, hashPassword, userID})

        await this.joinUserToRoom(name,userID)

        const roomDto = new PublicRoomDTO(room);

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
        if (null !== await getUserPublicRoom(name, userID)){
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

    async getUserRoomsWithLogins(userID: string) {
        return (await getUserPublicRoomsWithUsersLogins(userID)).map(r=>new PublicRoomWithLoginsDTO(r));
    }

    async getRoomByNameWithLogins(name: string) {
        return new PublicRoomWithLoginsDTO((await getPublicRoomByNameWithUsersLogins(name))[0]);
    }

    async getUserPublicRoomWithMessages(roomID:string, userID:string) {
        // const myData = await findUserByID(userID)
        // if (!myData)
        //     throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)
        if (null === await getUserPublicRoomByID(roomID, userID)){
            throw ApiError.BadRequest(`Вы не являетесь участником комнаты c id ${roomID}!`)
        }

        return new PublicRoomWithMessagesDTO((await getUserPublicRoomWithMessages(roomID,userID))[0]);
    }

    async getUserPublicRoomsWithMessages(userID:string) {
        // const myData = await findUserByID(userID)
        // if (!myData)
        //     throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)


        return (await getUserPublicRoomsWithMessages(userID)).map(r=>new PublicRoomWithMessagesDTO(r));
    }
}

export default new PublicRoomService()