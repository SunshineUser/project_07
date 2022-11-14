const express =  require('express');
const usersRouter = express.Router();
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;



//calling get all users, getuserbytusername
const { getAllUsers, getUserByUsername } = require('../db/');

usersRouter.use((req,res,next) =>{
    console.log("a request is being made to /users");

    // res.send({ message: 'hello from /users!'})
    next()
})


usersRouter.post('/login', async(req,res,next)=>{
    const { username, password } =req.body;

    // check if username == valid
    if (!username || !password){
        next({
            name: "MissingCreditialsError",
            message: "PLEASE SUPPLY BOTH A USERNAME AND PASSWORD"
        });
    } //if username

    try{
        const user = await getUserByUsername(username);

        if (user && user.password == password){
            // create token and return to user
                const newToken = jwt.sign({
                    username: username,
                }, JWT_SECRET,{
                    expiresIn:"1w"
                })

            res.send({ message: "you're loggied in!", newToken});
        } else {
            next({
                name: 'IncorrectCredentialsError',
                message: 'Username or password is incorrect'
            })
        } //else close
    } catch(error){
        console.log(error);
        next(error);
    }//catch close
})

usersRouter.get('/', async(req,res) =>{
    const users = await getAllUsers();

    res.send({
        users
    });
});




module.exports = usersRouter;