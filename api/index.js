const express = require('express');
const apiRouter = express.Router();

const jwt = require('jsonwebtoken');
const {getUserById} = require('../db');
const {JWT_SECRET} = process.env;


apiRouter.use(async (req,res,next)=>{
    const prefix = 'Bearer ';
    const auth = req.header('Authorization');

    //go away if you don't have authorization
    if(!auth){
        // res.send("invalid credentials")
        next();
    } else if(auth.startsWith(prefix)){
        //slice 8 into the token to only get the token from the bearer
        const token = auth.slice(prefix.length);
        // console.log(token);
        try{
            
            const { id } = jwt.verify(token, JWT_SECRET);
            console.log(id)
            if(id){
                req.user = await getUserById(id);
                next();
            }
        } catch({ name, message }){
            next({name, message});
        }
    } else{
        next({
            name: 'AuthorizationHeaderError',
            message: `Authorization token must start with ${ prefix }`
        })
    }
});

apiRouter.use((req,res,next)=>{
    if(req.user){
        console.log("User is set:", req.user);
    }

    next();
});

const usersRouter = require('./users');
const postsRouter = require('./posts');
const tagsRouter = require('./tags');

apiRouter.use('/posts', postsRouter);
apiRouter.use('/users', usersRouter);
apiRouter.use('/tags', tagsRouter);

apiRouter.use((error, req, res, next)=>{
    res.send({
        name: error.name,
        message: error.message
    });
});


module.exports = apiRouter;