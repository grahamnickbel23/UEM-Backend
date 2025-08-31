
export default class genaralResponse {

    // typical 200 response
    static genaral200Response(comment, res) {

        return res.status(200).json({
            success: true,
            message: comment
        })
    }

    // typical 400 response
    static genaral400Error(trigger, comment, res) {

        // trigger response
        if (trigger) {
            return res.status(400).json({
                success: false,
                message: comment
            })
        }
    }

    // typical 404 error
    static genaral404Error(trigger, comment, res){

        // trigger response
        if(trigger){
            return res.status(404).json({
                sucess: false,
                message: `${comment} does not exist`
            })
        }
    }

    // full custom error
    static fullCustomError(trigger, comment, code, res){

        // trigger response
        if(trigger){
            return res.status(code).json({
                sucess: false,
                message: comment
            })
        }
    }
}