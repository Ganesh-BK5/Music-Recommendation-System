const express=require('express')
const router=express.Router();
const UserController = require('../controllers/userController');


router.post('/users', UserController.createUser);
router.get('/users/:userId', UserController.getUserById);


module.exports=router;