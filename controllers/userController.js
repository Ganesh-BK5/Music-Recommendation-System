const User=require('../models/userModel')
const bcrypt = require('bcrypt');


async function createUser(req,res){
    try {
        const { username, email, password } = req.body;
        //hasing the password
        const hashedPassword=await bcrypt.hash(password,10);
        const newUser = new User({ username, email, password:hashedPassword});
        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
}

async function getUserById(req, res) {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
 }

 module.exports={
    createUser,
    getUserById,
 };