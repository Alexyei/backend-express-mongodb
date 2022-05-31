import {
    IPrivateRoomWithLeaveUsersDAO,
    IPrivateRoomWithMessagesDAO,
    IPrivateRoomWithMessagesLazyDA0
} from "../dao/privateRoomDAO";

interface IPrivateRoomDTO{
    name: string;
    id: string;
    users: {
        login: string
    }[],
}


interface IPrivateRoomWithMessagesDTO extends IPrivateRoomDTO{
    messages: {
        id: string
        author: {
            login: string
        }
        message: string,
        createdAt: string
    }[]

}

interface IPrivateRoomWithMessagesLazyDTO extends IPrivateRoomWithMessagesDTO{
    lastMessage:string
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

export class PrivateRoomWithMessagesDTO implements IPrivateRoomWithMessagesDTO{
    name;
    users;
    id;
    messages;

    constructor(model:IPrivateRoomWithMessagesDAO, userLogin: string) {
        this.name = getName(model.users, userLogin);
        this.id = model._id.toString();
        this.users = model.users;
        this.messages = model.messages.map(m=>({...m,id:m._id.toString()}));
    }
}

export class PrivateRoomWithMessagesLazyDTO implements IPrivateRoomWithMessagesLazyDTO{
    name;
    users;
    id;
    messages;
    lastMessage;

    constructor(model:IPrivateRoomWithMessagesLazyDA0, userLogin: string) {
        this.name = getName(model.users, userLogin);
        this.id = model._id.toString();
        this.users = model.users;
        this.messages = model.messages.map(m=>({...m,id:m._id.toString()}));
        this.lastMessage = model.lastMessage.toISOString();
    }
}