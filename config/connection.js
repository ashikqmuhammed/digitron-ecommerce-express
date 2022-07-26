// const mongoose = require('mongoose');
// mongoose.connect('mongodb://localhost/webstore',{
//     useNewUrlParser:true

// }).then(()=>{
//     console.log('db connected');

// }).catch((e)=>{
//     console.log('db connection failed');
// })
require('dotenv').config()
const mongoose = require('mongoose');
mongoose.connect(process.env.DB_KEY,{

    useNewUrlParser:true

}).then((data)=>{
    console.log('mongodb atlas connected');
    return data
}).catch((e)=>{
    console.log(e+"mongodb atlas connection failed");
})
