import {IUserDocument} from "../models/userModel";

import bcrypt from "bcrypt";

import ApiError from "../exceptions/ApiError";

import UserDto from "../dtos/userDTO";

import {createUser,  findUserByEmail} from "../dao/userDAO";
import sessionAuthLimitService from "./sessionAuthLimitService";

class UserService {
    async registration(email:string, login:string, password:string) {
        const hashPassword = await bcrypt.hash(password, 3);

        const user:IUserDocument = await createUser({email, login, hashPassword})



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
            await sessionAuthLimitService.add(email)
            throw ApiError.BadRequest('Неверный email или пароль');
        }
        await sessionAuthLimitService.remove(email)
        const userDto = new UserDto(user);

        return userDto;
    }
}

export default new UserService();
