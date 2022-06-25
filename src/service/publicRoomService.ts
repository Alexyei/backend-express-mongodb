import {
    createPublicRoom,
    getPublicRoomByName,
    getUserPublicRoomsWithUsersLogins,
    getUserPublicRoom,
    getPublicRoomByNameWithUsersLogins,
    getUserPublicRoomWithMessages,
    getUserPublicRoomsWithMessages,
    getUserPublicRoomByID,
    getUserPublicRoomByIDWithLastMessages,
    getUserPublicRoomsWithLastMessagesLazy, getUserPublicRoomsWithLastMessagesLazyALL
} from "../dao/publicRoomDAO";
import {IPublicRoomDocument} from "../models/roomModel";
import {
    PublicRoomDTO,
    PublicRoomWithLoginsDTO,
    PublicRoomWithMessagesDTO,
    PublicRoomWithMessagesDTOLazy,

} from "../dtos/publicRoomDTO";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import ApiError from "../exceptions/ApiError";
import config from '../config/default'
import UserLimitsService from './userLimitsService'
class PublicRoomService{
    async create(name:string, password:string, userID:string, withoutLimitsMode=false) {
        if (!withoutLimitsMode && !(await UserLimitsService.checkUserLimit(userID,"publicRoomCreateInDay")))
            throw ApiError.BadRequest('Достигнут дневной лимит создания публичных комнат')

        const hashPassword = password ? await bcrypt.hash(password, 3) : null;

        const room:IPublicRoomDocument = await createPublicRoom({name, hashPassword, userID})

        await UserLimitsService.reduceUserLimit(userID,{publicRoomCreateInDay:1})

        await this.joinUserToRoom(name,userID)

        const roomDto = new PublicRoomDTO(room);

        return roomDto;
    }

    async join(name:string, password:string, userID:string, withoutLimitsMode=false) {
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

        if (!withoutLimitsMode && room.users.length >= config.userLimits.publicRoom.maxUsersCount)
            throw ApiError.BadRequest(`Количество участник комнаты не может быть больше ${config.userLimits.publicRoom.maxUsersCount}`)

        if (!withoutLimitsMode && !(await UserLimitsService.checkUserLimit(userID,"publicRoomJoinInDay")))
            throw ApiError.BadRequest('Достигнут дневной лимит вступления в публичные комнаты')

        await this.joinUserToRoom(name,userID)

        await UserLimitsService.reduceUserLimit(userID,{publicRoomJoinInDay:1})

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

    async getUserPublicRoomWithMessagesLazy(roomID:string, userID:string, messagesLimit:number) {
        if (null === await getUserPublicRoomByID(roomID, userID)){
            throw ApiError.BadRequest(`Вы не являетесь участником комнаты c id ${roomID}!`)
        }

        return new PublicRoomWithMessagesDTO((await getUserPublicRoomByIDWithLastMessages(roomID,userID, messagesLimit))[0]);
    }

    async getUserPublicRoomsWithMessagesLazy(userID:string,roomsLimit:number, messagesLimit:number, from:string, nin:string[]) {
        const data = await getUserPublicRoomsWithLastMessagesLazy(userID,roomsLimit,messagesLimit,new Date(from),nin)
        // const data1 = await getUserPublicRoomsWithLastMessagesLazyALL(userID,roomsLimit,messageLimit,new Date(from),nin)
        // const a = data.map(d=>(d.lastMessage as any).toISOString());
        // const b = data1.map(d=>(d.lastMessage as any).toISOString());
        return data.map(r=>new PublicRoomWithMessagesDTOLazy(r));
    }
}

export default new PublicRoomService()