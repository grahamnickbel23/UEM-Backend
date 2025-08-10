import jwt from 'jsonwebtoken'
import uuid from 'uuid';

export default function jwtPerser(req, res, next) {
    // get the bearrer token from the request
    const authHeader = req.headers.authorization;

    // return error if no token is there
    if (!authHeader) {
        return res.status(400).json({
            success: false,
            message: `missing or invalid authorization`
        })
    }

    // if token is there cheak is it valid
    const token = authHeader.split(" ")[1];

    const doesItReal = jwt.verify(token, process.env.JWT_KEY); 

    // if fake return error
    if (!doesItReal){
        return res.status(400).json({
            message: false,
            message: `invalid token`
        })
    }

    // if all ok return payload
    req.token = doesItReal;

    // attach an unique id to all incoming request
    const requestId = uuid();
    req.requestId = requestId;

    // foroward this to next
    next();
}