// assign port name and call express and assign express to app
const { client, getUserById } = require('./db/index');
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
client.connect();
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
app.get('/',(req,res, next)=>{
    res.send(`<div>welcome to my website</div>`)
    console.log("Here's my request");
    next();
})

// app.get('/background/:color',(req,res,next)=>{
//     res.send(`
//         <body style ="background: ${req.params.color};">
//         <h1>Hello World</h1>
//         </body>
//     `);
// });



// jwt.verify() //2 arguments, what is the token, what is the server-side secret
// async function decryptJWT(req,res,next){
//     try{
//         // console.log("this is req.headers" , req.headers);
//         const authHeader= req.headers.authorization

//         if (!authHeader){
//             res.send("invalid credentials")
//             next()
//         }else{
//             const slicedToken = authHeader.slice(7);
//             const { id } = jwt.verify(slicedToken, JWT_SECRET);

//             console.log("this is our id  ", id);
//             const user = await getUserById(id);
//             req.user= user;
//         }
//         next();

//     }catch(error){
//         console.log(error)
//     }
// }
// app.use(decryptJWT)




// jwt.sign() //create a new json web token 3 arguments, (encryptdata, secret, expiration time ))
// app.post("/api/users/register", (req,res,next) =>{
//     try{
//         let newUserData = req.body;

//         const newToken = jwt.sign({
//             username: newUserData.username
//         }, JWT_SECRET,{
//             expiresIn:"1w"
//         })

//         console.log('This is my new token '  + newToken)
//         res.end();
//     } catch(error){
//         console.log(error)
//     }
// })

// app.post('/api/users/login', () =>{

// })

// app.delete('/api/users/:id', () =>{

// })



// this is our listen that is listening through the port on the browser
app.listen(PORT, ()=>{
    console.log('The server is up on port', PORT);
})
