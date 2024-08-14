const express = require('express')
const cookieParser=require('cookie-parser')
require('dotenv').config();
const mongoose=require('mongoose')
const app = express()


//importing local files
const User = require('./models/userModel');
const userRouter = require('./routes/userRouter');
const userLogout = require('./routes/userLogout');
const userLogin = require('./routes/userLogin');
const userMood = require('./routes/userMood');
//onst spotifyAuthRoutes = require('./routes/spotifyAuthRoutes');
const { router: spotifyAuthRoutes } = require('./routes/spotifyAuthRoutes');



//setting environment variable for port
const PORT=process.env.PORT||8070
//mongodb connection string
const murl='mongodb://localhost:27017/MRS'


//mongodb connection
mongoose.connect(murl).then(()=>console.log("MongodbConnected")).catch((err)=>console.log("Error Occured!!"))



//middleware
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser())



app.get('/', function (req, res) {
    res.send('Hello World')
  })
app.use('/api', userRouter);
app.use('/login',userLogin);
app.use('/logout',userLogout);
app.use('/mood',userMood);
app.use('/auth', spotifyAuthRoutes);







app.listen(PORT,()=>console.log('Server Started at 8070'))