import {findUserByID, findUserByLogin} from "../dao/userDAO";
import ApiError from "../exceptions/ApiError";
import {
    createPrivateRoom, getOpenedPrivateRoomByID,
    getPrivateRoomByID,
    getPrivateRoomByUsers,
    getUserPrivateRoomsWithLeaveUsers, getUserPrivateRoomWithLeaveUsers,
    getUserPrivateRoomsWithMessages, getUserPrivateRoomWithMessages, getUserPrivateRoomByID
} from "../dao/privateRoomDAO";
import {PrivateRoomWithLeaveUsersDTO, PrivateRoomWithMessagesDTO} from "../dtos/privateRoomDTO";
import {getUserPublicRoomByID} from "../dao/publicRoomDAO";


class PrivateRoomService {
    async createOrOpen(login: string, userID: string) {
        const another_user = await findUserByLogin(login);
        if (another_user === null)
            throw ApiError.BadRequest(`Пользователь ${login} не найден!`);

        const privateRoomData = await getPrivateRoomByUsers(another_user.id, userID);
        if (privateRoomData) {
            if (await this.checkUserNotLeaveRoom(privateRoomData.id, userID))
                throw ApiError.BadRequest('У вас уже открыт этот чат');
            else {
                await this.openPrivateRoom(privateRoomData.id)
            }
        } else {
            await this.createRoom(another_user.id, userID)
        }

        return await this.getUserPrivateRoomWithMessages(another_user.id, userID);
    }

    async createRoom(anotherUserID: string, userID: string) {
        // Если мы пишем не себе, то другой пользователь считается покинувшим чат
        // Когда мы отправим ему сообщени, он присоединиться к чату
        const leave_users = anotherUserID !== userID ? [anotherUserID] : []

        // Приватный чат с другим пользователем, или чат с самим собой
        const users = anotherUserID !== userID ? [anotherUserID, userID] : [userID]
        return await createPrivateRoom(users, leave_users);
    }

    async checkUserNotLeaveRoom(privateRoomID: string, userID: string) {
        return null !== await getOpenedPrivateRoomByID(privateRoomID, userID)
    }

    async openPrivateRoom(roomID: string) {
        const room = await getPrivateRoomByID(roomID)
        if (room !== null) {
            room.leave_users = [];
            await room.save();
        }
    }

    // async leavePrivateRoom(roomID:string, userID:string) {
    //     const room = await this.getUserPrivateRoom(roomID, userID)
    //     if (!room) {
    //         throw ApiError.BadRequest('Комната не найдена')
    //     }
    //
    //     await this.removeUserFromPrivateRoom(roomID, userID)
    //
    //     return await this.getUserPrivateRoomWithLeaveUsers(room.users.filter(id=>id.toString()!=userID)[0].toString(),userID);
    // }

    // async removeUserFromPrivateRoom(roomID:string,  userID:string){
    //     const room = await findPrivateRoomByID(roomID)
    //     if (room!== null)
    //     {
    //         room.leave_users.push(new mongoose.Types.ObjectId(userID));
    //         if (room.users.length == room.leave_users.length){
    //             // await RoomMessageModel.deleteMany({room: room._id})
    //             await deletePrivateRoomByID(roomID)
    //         }else{
    //             await room.save();
    //         }
    //     }
    //
    //
    // }

    async getUserPrivateRoomWithMessagesByID(roomID:string, userID:string){
        const room = await getPrivateRoomByID(roomID);
        if (room === null)
            throw ApiError.BadRequest(`Комната с id ${roomID} не найдена!`);

        const myData = await findUserByID(userID)
        if (!myData)
            throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)

        if (null === await getUserPrivateRoomByID(roomID, userID)){
            throw ApiError.BadRequest(`Вы не являетесь участником комнаты!`)
        }

        const users = room.users.filter(id=>id.toString()!=userID);
        const another_user_id = users.length == 1 ? users[0].toString() : userID;

        return (await getUserPrivateRoomWithMessages(another_user_id, userID)).map(r => new PrivateRoomWithMessagesDTO(r, myData.login)).shift();
    }

    async getUserPrivateRoomWithMessages(anotherUserID:string, userID: string){
        const another_user = await findUserByID(anotherUserID);
        if (another_user === null)
            throw ApiError.BadRequest(`Пользователь с id ${anotherUserID} не найден!`);

        const myData = await findUserByID(userID)
        if (!myData)
            throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)

        return (await getUserPrivateRoomWithMessages(another_user.id, userID)).map(r => new PrivateRoomWithMessagesDTO(r, myData.login)).shift();
    }

    async getUserPrivateRoomsWithMessages(userID: string) {
        const userData = await findUserByID(userID)
        if (!userData)
            throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)
        return (await getUserPrivateRoomsWithMessages(userID)).map(r=>new PrivateRoomWithMessagesDTO(r, userData.login));
    }

    async getUserPrivateRoomWithLeaveUsers(anotherUserID: string, userID: string) {
        const another_user = await findUserByID(anotherUserID);
        if (another_user === null)
            throw ApiError.BadRequest(`Пользователь с id ${anotherUserID} не найден!`);

        const userData = await findUserByID(userID)
        if (!userData)
            throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)
        return (await getUserPrivateRoomWithLeaveUsers(anotherUserID, userID)).map(r => new PrivateRoomWithLeaveUsersDTO(r, userData.login))[0];
    }

    async getUserPrivateRoomsWithLeaveUsers(userID: string) {
        const userData = await findUserByID(userID)
        if (!userData)
            throw ApiError.BadRequest(`Пользователь c id ${userID} не найден!`)
        return (await getUserPrivateRoomsWithLeaveUsers(userID)).map(r => new PrivateRoomWithLeaveUsersDTO(r, userData.login));
    }

    // async getUserPrivateRoom(anotherUserID:string,userID: string) {
    //     return await findPrivateRoomByUsers(anotherUserID,userID);
    // }
}

export default new PrivateRoomService();