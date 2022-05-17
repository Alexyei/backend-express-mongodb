
import {IPrivateRoomWithLeaveUsersDAO} from "../dao/privateRoomDAO";

interface IPrivateRoomDTO{
    name: string;
    id: string;
    users: {
        login: string
    }[],
}

interface IPrivateRoomWithLeaveUsersDTO extends IPrivateRoomDTO{
    leave_users: {
        login: string
    }[],
}

function getName(users: {login:string}[], userLogin: string){
    if (users.length == 1)
        return userLogin;
    else return users.filter(u=>u.login !== userLogin)[0].login;
}


export class PrivateRoomDto implements IPrivateRoomDTO{
    name;
    users;
    id;


    constructor(model:IPrivateRoomWithLeaveUsersDAO, userLogin: string) {
        this.name = getName(model.users, userLogin);
        this.id = model._id.toString();
        this.users = model.users;
    }
}

export class PrivateRoomWithLeaveUsersDTO implements IPrivateRoomWithLeaveUsersDTO{
    name;
    users;
    id;
    leave_users;

    constructor(model:IPrivateRoomWithLeaveUsersDAO, userLogin: string) {
        this.name = getName(model.users, userLogin);
        this.id = model._id.toString();
        this.users = model.users;
        this.leave_users = model.leave_users;
    }
}