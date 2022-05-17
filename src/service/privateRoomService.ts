import {findUserByID, findUserByLogin} from "../dao/userDAO";
import ApiError from "../exceptions/ApiError";
import {
    createPrivateRoom, getOpenedPrivateRoomByID,
    getPrivateRoomByID,
    getPrivateRoomByUsers, getUserPrivateRoomsWithLeaveUsers, getUserPrivateRoomWithLeaveUsers
} from "../dao/privateRoomDAO";
import {PrivateRoomWithLeaveUsersDTO} from "../dtos/privateRoomDTO";


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

        return await this.getUserPrivateRoomWithLeaveUsers(another_user.id, userID);
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
}

export default new PrivateRoomService();