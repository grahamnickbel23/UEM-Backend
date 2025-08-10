export default function adminCheak(req, res, next){

    // get the user info
    const userInfo = req.userinfo;

    // cheak if user admin or not
    const doesUserAdmin = userInfo.role;

    // if admin go ahead
    if(doesUserAdmin === 'admin'){
        next();
    }

    // if not admin return error
    if (doesUserAdmin === 'faculty'){
        return res.status(409).json({
            success: false,
            message: `user does not have acess to specific route`
        })
    }else{
        return res.status(400).json({
            sucess: false,
            message: `invalid acess token`
        })
    }
}