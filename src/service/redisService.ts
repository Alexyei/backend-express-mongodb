import redisClient from "../db/redis";

class RedisService{
    async getAllKeys(){
       return await redisClient.v4.KEYS('*')
    }

    async getKey(key:string){
        return await redisClient.v4.GET(key)
    }


}

export default new RedisService();
