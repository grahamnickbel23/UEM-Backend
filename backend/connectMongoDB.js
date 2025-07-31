import mongoose from "mongoose";

export default async function mongoDBConnect(){
    try{

        await mongoose.connect(process.env.MONGODB_URL);
        console.log(`MongoDB connected !!`);

    }catch (e){

        console.log(`MongoDB connection error: ${e}`);
        
    }
}