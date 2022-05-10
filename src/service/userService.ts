import UserModel, {UserDocument} from "../models/userModel";

import bcrypt from "bcrypt";

import ApiError from "../exceptions/ApiError";

import UserDto from "../dtos/userDTO";

import {createUser,  findUserByEmail} from "../dao/userDAO";

class UserService {
    async registration(email:string, login:string, password:string) {
        const hashPassword = await bcrypt.hash(password, 3);

        const user:UserDocument = await createUser({email, login, hashPassword})



        const userDto = new UserDto(user); // id, email, isActivated


        return userDto;
    }

    async login(email:string, password:string) {
        const user = await findUserByEmail(email)
        if (!user) {
            throw ApiError.BadRequest('Пользователь с таким email не найден')
        }
        const isPassEquals = await bcrypt.compare(password, user.password);
        if (!isPassEquals) {
            throw ApiError.BadRequest('Неверный email или пароль');
        }
        const userDto = new UserDto(user);

        return userDto;
    }
}

export default new UserService();
