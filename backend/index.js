import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import mongoDBConnect from './connectMongoDB.js';

const app = express();

app.use(express.json());

// connect Db
mongoDBConnect();

const PORT = process.env.PORT  || 3000;

// basic api routes
app.get("/home", (req, res) => {
    return res.status(200).json({
        message: "we trust you bro"
    })
})

// app.listen
app.listen(PORT, () => {
    console.log(`server is running at port: ${PORT}`);
})