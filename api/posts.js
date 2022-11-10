const express = require('express');
const postsRouter = express.Router();

const {getAllPosts} = require('../db');

postsRouter.use((req,res,next)=>{
    console.log("A REQUEST HAS BEEN SENT FOR ALL THE POSTS IN THE GLORIOUS LAND0213465")

    next();
});

postsRouter.use('/', async(req,res)=>{
    const posts = await getAllPosts();

    res.send({
        posts
    });
});


module.exports = postsRouter;