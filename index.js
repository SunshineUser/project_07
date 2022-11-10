const PORT = 3000;
const express = require('express');
const app = express();
const morgan = require('morgan')
const apiRouter = require('./api');
const { client } = require('./db');


app.use(morgan('dev'))
app.use('/api', apiRouter);
app.use(express.json());



// app.use((req, res, next) => {
//     console.log("<____Body Logger START____>");
//     console.log(req.body);
//     console.log("<_____Body Logger END_____>");
  
//     next();
// });
client.connect();
app.use('/',(req,res, next)=>{
    console.log("Here's my request");
    next();
})

// app.post('/api/users/register',(req,res,next)=>{
//     console.log("here's a request to register")
//     res.send({message: "succcessssss!"})
// })

// app.post('/api/users/login',(req,res,next)=>{
//     console.log("here's a request to login")
//     res.send({message: "succcessssss!"})
// })

// app.post('/api/users/:id',(req,res,next)=>{
//     console.log("here's a request to get an ID")
//     res.send({message: "succcessssss!"})
// })


app.listen(PORT, ()=>{
    console.log('The server is up on port', PORT);
})

 
