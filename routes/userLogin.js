const express = require('express');
require('dotenv').config();
const router = express.Router();
const bcrypt=require('bcrypt')
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');

router.post('/logindone',async(req,res)=>{
    const{email,password}=req.body;
    try{
        const user=await User.findOne({email});
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        //compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        //if match then generate JWT token
        const payload = {  email: user.email };
        const token = jwt.sign(payload, process.env.jwtSecret, { expiresIn: '1h' });
        res.json({ token });
         

    }catch(err){
        console.error(err.message);
        res.status(500).send('Server error');   
    }
})



module.exports=router;


