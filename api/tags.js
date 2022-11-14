const express = require('express');
const tagsRouter = express.Router();
const { requireUser } = require('./utils');

const {getAllTags, getPostsByTagName} = require('../db');

tagsRouter.use((req,res,next) =>{
    console.log("a request is being made to /tags");

    next();
});

//wooooooooooooooooo! got this one in like 3 minutes.
tagsRouter.get(`/:tagname/posts` ,async(req,res,next)=>{
    console.log(req.params.tagname);
    try{
        const allPosts = await getPostsByTagName(req.params.tagname)
        const posts = allPosts.filter(post => {
            // the post is active, doesn't matter who it belongs to
            if (post.active) {
              return true;
            }
          
            // the post is not active, but it belogs to the current user
            if (req.user && post.author.id === req.user.id) {
              return true;
            }
          
            // none of the above are true
            return false;
          });
        res.send({posts});
    }catch({name,message}){
        next({name,message});
    }
})


tagsRouter.get('/', async(req,res)=>{
    const tags = await getAllTags();

    res.send({
        tags
    });
});

module.exports = tagsRouter;