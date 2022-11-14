const express = require('express');
const apiRouter = express.Router();
const {getUserById, getUserByUsername} = require('../db');
const jwt = require('jsonwebtoken');

const {JWT_SECRET} = process.env;

const usersRouter = require('./users');
apiRouter.use('/users', usersRouter);
const tagsRouter = require('./tags');
apiRouter.use('./tags',tagsRouter);
const postsRouter = require('./posts');
apiRouter.use('/posts', postsRouter);


apiRouter.use(async(req,res,next)=>{
    const prefix = 'Bearer ';
    const auth = req.headers.authorization;
    console.log("this is message" + req.headers.authorization);

    //go away if you don't have authorization
    
        try{
            if(!auth){
                res.send("invalid credentials")
                next();
            } else if(auth.startsWith(prefix)){
                //slice 8 into the token to only get the token from the bearer
                const token = auth.slice(7);
                // console.log(token);
            const {username} = jwt.verify(token, JWT_SECRET);

            // console.log("is this jason." +jasonInfo.keys())
            if (username) {
                req.user = await getUserByUsername(username);
                next();
            }
        } 
        } catch({ name, message }){
            next({name, message});
        }
    
});

apiRouter.use((req,res,next)=>{
    if(req.user){
        console.log("User is set:", req.user);
    }

    next();
});




apiRouter.use((error, req, res, next)=>{
    res.send({
        name: error.name,
        message: error.message
    });
});


module.exports = apiRouter;