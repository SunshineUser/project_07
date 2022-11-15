
function requireUser(req,res, next){
    if(!req.user){
        next({
            name: "MissingUserError",
            message: "You MUST be loggied in to perform this action"
        });
    }
    next();
}

module.exports ={
    requireUser
}