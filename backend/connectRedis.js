import { createClient } from "redis";
import logger from "./src/logger/log logger.js";

export const redisConnect = createClient({
    url: "redis://redis:6379"
})

export async function connectRedis() {
    try{
        await redisConnect.connect();
        logger.info(`Redis local DB connected !!`)
    }catch(err){
        logger.error(`Redis connection error: ${err}`)
    }
};