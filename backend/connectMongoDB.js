import mongoose from "mongoose";
import logger from "./src/logger/log logger.js";
import dbLogger from "./src/middelewere/dbLogger secure.js";

export default async function mongoDBConnect(){
    try{
        // log all mongodb oparation
        mongoose.plugin(dbLogger);

        // connect db and log them
        await mongoose.connect(process.env.MONGODB_URL);
        logger.info(`MongoDB connected !!`);

    }catch (e){

        logger.error(`MongoDB connection error: ${e}`);
        
    }
}