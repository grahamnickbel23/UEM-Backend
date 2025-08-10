import dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import mongoDBConnect from './connectMongoDB.js';
import connectAWS from './connectAWS.js';
import basicAuth from './src/routes/basicAuth route.js';
import authRoute from './src/routes/auth route.js';
import achivementRoute from './src/routes/achivement route.js';
import jwtPerser from './src/middelewere/jwtPerser secure.js';

const app = express();

// basic json perser middele were
app.use(express.json());

// connect Db
mongoDBConnect();
connectAWS();

const PORT = process.env.PORT  || 3000;

// public api, basic auth
app.use('/auth', basicAuth);

// basic jwt middelwere 
app.use(jwtPerser);

// api routes
app.use('/auth', authRoute);
app.use('/achivement', achivementRoute);

// basic test api routes
app.get("/home", (req, res) => {
    return res.status(200).json({
        message: "we trust you bro"
    })
})

// app.listen
app.listen(PORT, () => {
    console.log(`server is running at port: ${PORT}`);
})