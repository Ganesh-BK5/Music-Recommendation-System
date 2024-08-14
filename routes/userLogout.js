const express=require('express')
const router=express.Router();
const jwt = require('jsonwebtoken');
//const config = require('config');


//const jwtSecret = config.get('jwtSecret');


router.post('/logoutdone', (req, res) => {
    try {
        res.cookie('token',"");
        res.redirect('/');
        res.json({ message: 'Logout successful' });
        
    } catch (err) {
        console.error('Error during logout:', err);
        res.status(500).json({ message: 'Logout failed' });
    }
});

module.exports=router;