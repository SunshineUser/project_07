const express = require('express');
const postsRouter = express.Router();
const { requireUser } = require('./utils');
const {getAllPosts, createPost, updatePost, getPostById} = require('../db');


postsRouter.post('/', requireUser, async(req,res,next) =>{
    //take the info from the request body and parsing it
    console.log("this is my reqqin body id " + req.user.id);
    const { title, content, tags = ""} = req.body;
    const authorId = req.user.id;
    // this is turning a string of tags into an array of tags through regex magic
    const tagArr = tags.trim().split(/\s+/)
    const postData = {authorId, title, content};

    //inserting the tag array into an object. but why?
    if(tagArr.length){
        postData.tags = tagArr;
    }

    try{
        const post= await createPost(postData);
        res.send({ post });
    }catch({ name, message}){
        next({name, message});
    }
})


postsRouter.patch('/:postId', requireUser, async (req, res, next) => {
    const { postId } = req.params;
    const { title, content, tags } = req.body;
  
    const updateFields = {};
  
    if (tags && tags.length > 0) {
      updateFields.tags = tags.trim().split(/\s+/);
    }
  
    if (title) {
      updateFields.title = title;
    }
  
    if (content) {
      updateFields.content = content;
    }
  
    try {
      const originalPost = await getPostById(postId);
  
      if (originalPost.author.id === req.user.id) {
        const updatedPost = await updatePost(postId, updateFields);
        console.log(updatedPost);
        res.send({ post: updatedPost })
      } else {
        next({
          name: 'UnauthorizedUserError',
          message: 'You cannot update a post that is not yours'
        })
      }
    } catch ({ name, message }) {
      next({ name, message });
    }
  });


  postsRouter.delete('/:postId', requireUser, async (req, res, next) => {
    try {
      const post = await getPostById(req.params.postId);
  
      if (post && post.author.id === req.user.id) {
        const updatedPost = await updatePost(post.id, { active: false });
  
        res.send({ post: updatedPost });
      } else {
        // if there was a post, throw UnauthorizedUserError, otherwise throw PostNotFoundError
        next(post ? { 
          name: "UnauthorizedUserError",
          message: "You cannot delete a post which is not yours"
        } : {
          name: "PostNotFoundError",
          message: "That post does not exist"
        });
      }
  
    } catch ({ name, message }) {
      next({ name, message })
    }
  });


postsRouter.use((req,res,next)=>{
    console.log("A REQUEST HAS BEEN SENT FOR ALL THE POSTS IN THE GLORIOUS LAND0213465")

    next();
});

postsRouter.get('/', async(req,res,next)=>{
    try{
        const allPosts = await getAllPosts();


        const posts = allPosts.filter(post =>{
            if(post.active){
                return true;
            }
            if(req.user && post.author.id === req.user.id){
                return true;
            }
            return false;
        })
        res.send({
            posts
        });
    }catch(error){

    }
    
});


module.exports = postsRouter;