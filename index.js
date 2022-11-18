// assign port name and call express and assign express to app
const PORT = 3000;
const express = require('express');
const app = express();

//calling the api router and assigning the json web token and dotenv and morgan .json reader and urlencoded

const morgan = require('morgan')
app.use(morgan('dev'))
// const jwt = require('jsonwebtoken');
// const { JWT_SECRET } = process.env;
require('dotenv').config();

app.use(express.json());
app.use(express.urlencoded({ extended:false }));

//calling the router
const apiRouter = require('./api');
app.use ('/api', apiRouter);
// getUserBy/client from the datatbase


// connect to the client before the app.use 

// are we here? if yes, then respond
app.use('*',(req,res,next)=>{
    console.log("we're looking for errors in the API")
    next();
})

app.use((req,res,next)=>{
    console.log("Request has been recieved express!")
    next();
})

// this is the first call that will route all calls from ./. on your website 
// app.get('/',(req,res, next)=>{
//     res.send(`<div>welcome to my website</div>`)
//     console.log("Here's my request");
//     next();
// })

// this is our listen that is listening through the port on the browser
app.listen(PORT, ()=>{
    console.log('The server is up on port', PORT);
})
