import { createClient } from "redis";

//localhost:6379
const redisClient = createClient({
    legacyMode: true
});

(async () => {
    // redisClient.on('error', (err) => console.log('Redis Client Error', err));
    await redisClient.connect();
})();

export default redisClient;